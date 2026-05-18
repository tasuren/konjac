use std::sync::atomic::{self, AtomicU32};

use futures_util::StreamExt;
use tauri_plugin_log::log;
use tokio::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager, State, async_runtime::JoinHandle};

use crate::{
    ipc_dto::{
        ProviderKindDto, TranslationRequestDto, TranslationRequestResultDto,
        TranslationStreamEventDto,
    },
    language::{LanguageInfo, LanguageResolver, ResolvedLanguagePair},
    llm::{GenerationEvent, GenerationRequest, GenerationStream, LlmProvider, OllamaProvider},
    prompt::{RenderTranslationPromptOptions, render_translation_prompt},
    settings::{ProviderSettings, Settings},
};

pub fn setup(app: &tauri::App, settings: &Settings) {
    let language_resolver = LanguageResolver::new(
        settings.auto_detection_settings.scope.clone().into(),
        settings.auto_detection_settings.fallback_to.clone().into(),
    );

    app.manage(Mutex::new(language_resolver));
    app.manage(Mutex::new(
        LlmProviders::new(&settings.providers).expect("Failed to create LLM providers."),
    ));
    app.manage(Mutex::new(TranslationSettings {
        system_prompt: settings.system_prompt.clone(),
        translation_prompt: settings.translation_prompt.clone(),
    }));
    app.manage(TranslationRequestIdStore::default());
    app.manage(Mutex::new(TranslationTaskStore::new(app.handle().clone())));
}

#[derive(Default)]
pub struct TranslationRequestIdStore(AtomicU32);

impl TranslationRequestIdStore {
    fn next(&self) -> u32 {
        self.0
            .fetch_add(1, atomic::Ordering::Relaxed)
            .wrapping_add(1)
    }
}

pub struct LlmProviders {
    pub ollama: OllamaProvider,
}

impl LlmProviders {
    pub fn new(settings: &ProviderSettings) -> anyhow::Result<Self> {
        Ok(Self {
            ollama: OllamaProvider::new(
                &settings.ollama.base_url,
                settings.ollama.keep_alive.clone(),
            )?,
        })
    }

    pub async fn generate_stream(
        &self,
        provider: ProviderKindDto,
        request: GenerationRequest,
    ) -> anyhow::Result<GenerationStream> {
        match provider {
            ProviderKindDto::Ollama => self.ollama.generate_stream(request).await,
        }
    }
}

pub struct TranslationSettings {
    system_prompt: Option<String>,
    translation_prompt: String,
}

struct LatestTranslationTask {
    request_id: u32,
    handle: JoinHandle<()>,
}

pub struct TranslationTaskStore {
    app: AppHandle,
    latest_task: Option<LatestTranslationTask>,
}

impl TranslationTaskStore {
    fn new(app: AppHandle) -> Self {
        Self {
            app,
            latest_task: None,
        }
    }

    fn set_latest_task(&mut self, request_id: u32, handle: JoinHandle<()>) {
        self.latest_task = Some(LatestTranslationTask { request_id, handle });
    }

    fn abort_latest_task(&mut self) {
        if let Some(task) = self.latest_task.take() {
            task.handle.abort();
            emit_stream_event(
                &self.app,
                TranslationStreamEventDto::Cancelled {
                    request_id: task.request_id,
                },
            );
        }
    }
}

#[tauri::command]
pub fn next_translation_request_id(request_id_store: State<'_, TranslationRequestIdStore>) -> u32 {
    request_id_store.next()
}

#[tauri::command]
pub async fn request_translation(
    app: AppHandle,
    providers: State<'_, Mutex<LlmProviders>>,
    language_resolver: State<'_, Mutex<LanguageResolver>>,
    settings: State<'_, Mutex<TranslationSettings>>,
    task_store: State<'_, Mutex<TranslationTaskStore>>,
    request: TranslationRequestDto,
) -> Result<TranslationRequestResultDto, String> {
    let mut task_store = task_store.lock().await;
    task_store.abort_latest_task();

    let ResolvedLanguagePair { source, target } = language_resolver.lock().await.resolve(
        request.source_language.into(),
        request.target_language.into(),
        &request.text,
    );

    let generation_request = build_generation_request(
        &*settings.lock().await,
        source.get_language_info(),
        target.get_language_info(),
        &request.text,
        request.model_id,
    )
    .await;

    let stream = {
        let lock = providers.lock().await;
        lock.generate_stream(request.provider, generation_request)
            .await
            .map_err(|e| e.to_string())?
    };

    let handle =
        tauri::async_runtime::spawn(stream_translation_text(app, request.request_id, stream));
    task_store.set_latest_task(request.request_id, handle);

    Ok(TranslationRequestResultDto {
        resolved_source_language: source.into(),
    })
}

async fn build_generation_request(
    settings: &TranslationSettings,
    source: &LanguageInfo,
    target: &LanguageInfo,
    text: &str,
    model_id: String,
) -> GenerationRequest {
    let generation_prompt = render_translation_prompt(RenderTranslationPromptOptions {
        template: &settings.translation_prompt,
        source_language_name: &source.name,
        source_language_code: &source.code,
        target_language_name: &target.name,
        target_language_code: &target.code,
        text: text,
    });

    GenerationRequest {
        model_id,
        system_prompt: settings.system_prompt.clone(),
        prompt: generation_prompt,
        history: Vec::new(),
    }
}

async fn stream_translation_text(
    app: tauri::AppHandle,
    request_id: u32,
    mut stream: GenerationStream,
) {
    let mut result = String::new();

    while let Some(event) = stream.next().await {
        match event {
            GenerationEvent::Delta(delta) => {
                result.push_str(&delta);
                emit_stream_event(
                    &app,
                    TranslationStreamEventDto::Delta {
                        request_id,
                        full_text: result.clone(),
                    },
                );
            }
            GenerationEvent::Finished(full_text) => {
                if let Some(full_text) = full_text {
                    result = full_text;
                }
                emit_stream_event(
                    &app,
                    TranslationStreamEventDto::Finished {
                        request_id,
                        full_text: result,
                    },
                );

                break;
            }
            GenerationEvent::Error(message) => {
                log::warn!("An error occurred during translation: {message}");
            }
        }
    }
}

fn emit_stream_event(app: &AppHandle, payload: TranslationStreamEventDto) {
    if let Err(e) = app.emit("translation-stream-event", payload) {
        log::warn!("Some translation event was not sent: {e:?}");
    };
}
