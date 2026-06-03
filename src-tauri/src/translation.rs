use std::sync::atomic;

use futures_util::StreamExt;
use tauri::{AppHandle, Emitter, async_runtime::JoinHandle};
use tauri_plugin_log::log;
use tokio::sync::Mutex;

use crate::{
    ipc_dto::{TranslationRequestDto, TranslationStreamEventDto},
    language::{
        DetectableLanguage, LanguageCode, LanguageResolver, ResolvedLanguagePair,
        ResolvedSourceLanguage, SourceLanguage, TargetLanguage, language_name_or_code,
    },
    llm::{
        GenerationEvent, GenerationRequest, GenerationStream, LlmProviders, Model, ProviderKind,
    },
    prompt::{RenderTranslationPromptOptions, render_translation_prompt},
    settings::Settings,
};

pub struct TranslationService {
    request_id_store: TranslationRequestIdStore,
    language_resolver: Mutex<LanguageResolver>,
    providers: Mutex<LlmProviders>,
    settings: Mutex<TranslationSettings>,
    task_store: Mutex<TranslationTaskStore>,
}

impl TranslationService {
    pub fn new(settings: &Settings) -> Self {
        let request_id_store = TranslationRequestIdStore::default();
        let language_resolver = build_language_resolver(settings);
        let providers = build_llm_providers(settings).expect("Failed to create LLM providers.");
        let settings = TranslationSettings::from_settings(settings);
        let task_store = TranslationTaskStore::new();

        Self {
            request_id_store,
            language_resolver: Mutex::new(language_resolver),
            providers: Mutex::new(providers),
            settings: Mutex::new(settings),
            task_store: Mutex::new(task_store),
        }
    }

    /// Applies persisted settings to runtime translation dependencies.
    pub async fn apply_settings(&self, settings: &Settings) -> anyhow::Result<()> {
        let language_resolver = build_language_resolver(settings);
        let providers = build_llm_providers(settings)?;
        let translation_settings = TranslationSettings::from_settings(settings);

        *self.language_resolver.lock().await = language_resolver;
        *self.providers.lock().await = providers;
        *self.settings.lock().await = translation_settings;

        Ok(())
    }

    pub fn next_request_id(&self) -> u32 {
        self.request_id_store.next()
    }

    pub async fn request_translation(
        &self,
        app: AppHandle,
        request: TranslationRequest,
    ) -> anyhow::Result<ResolvedSourceLanguage> {
        let mut task_store = self.task_store.lock().await;
        task_store.abort_latest_task(&app);

        let ResolvedLanguagePair { source, target } = self.language_resolver.lock().await.resolve(
            request.source_language.into(),
            request.target_language.into(),
            &request.text,
        );

        let generation_request = build_generation_request(
            &*self.settings.lock().await,
            source.get_language_info(),
            &target.0,
            &request.text,
            request.model_id,
        );

        let stream = {
            let lock = self.providers.lock().await;
            lock.generate_stream(request.provider, generation_request)
                .await?
        };

        let handle = tauri::async_runtime::spawn(async move {
            stream_translation_text(app, request.request_id, stream).await;
        });
        task_store.set_latest_task(request.request_id, handle);

        Ok(source)
    }

    pub async fn list_models(&self) -> anyhow::Result<Vec<Model>> {
        self.providers.lock().await.list_models().await
    }
}

struct TranslationSettings {
    system_prompt: Option<String>,
    translation_prompt: String,
}

impl TranslationSettings {
    fn from_settings(settings: &Settings) -> Self {
        Self {
            system_prompt: settings.system_prompt.clone(),
            translation_prompt: settings.translation_prompt.clone(),
        }
    }
}

fn build_language_resolver(settings: &Settings) -> LanguageResolver {
    LanguageResolver::new(
        settings.auto_detection.scope.clone().into(),
        settings
            .auto_detection
            .custom_detection_scope
            .iter()
            .cloned()
            .map(Into::into)
            .collect(),
        settings
            .auto_detection
            .fallback_to
            .clone()
            .0
            .parse()
            .unwrap_or(DetectableLanguage::English),
    )
}

fn build_llm_providers(settings: &Settings) -> anyhow::Result<LlmProviders> {
    LlmProviders::new(&settings.providers)
}

#[derive(Default)]
pub struct TranslationRequestIdStore(atomic::AtomicU32);

impl TranslationRequestIdStore {
    pub fn next(&self) -> u32 {
        self.0
            .fetch_add(1, atomic::Ordering::Relaxed)
            .wrapping_add(1)
    }
}

pub struct TranslationRequest {
    pub request_id: u32,
    pub provider: ProviderKind,
    pub model_id: String,
    pub source_language: SourceLanguage,
    pub target_language: TargetLanguage,
    pub text: String,
}

impl From<TranslationRequestDto> for TranslationRequest {
    fn from(value: TranslationRequestDto) -> Self {
        Self {
            request_id: value.request_id,
            provider: value.provider.into(),
            model_id: value.model_id,
            source_language: value.source_language.into(),
            target_language: value.target_language.into(),
            text: value.text,
        }
    }
}

struct LatestTranslationTask {
    request_id: u32,
    handle: JoinHandle<()>,
}

pub struct TranslationTaskStore {
    latest_task: Option<LatestTranslationTask>,
}

impl TranslationTaskStore {
    fn new() -> Self {
        Self { latest_task: None }
    }

    fn set_latest_task(&mut self, request_id: u32, handle: JoinHandle<()>) {
        self.latest_task = Some(LatestTranslationTask { request_id, handle });
    }

    fn abort_latest_task(&mut self, app: &AppHandle) {
        if let Some(task) = self.latest_task.take() {
            task.handle.abort();
            emit_translation_stream_event(
                app,
                TranslationStreamEvent::Cancelled {
                    request_id: task.request_id,
                },
            );
        }
    }
}

fn build_generation_request(
    settings: &TranslationSettings,
    source: &LanguageCode,
    target: &LanguageCode,
    text: &str,
    model_id: String,
) -> GenerationRequest {
    let generation_prompt = render_translation_prompt(RenderTranslationPromptOptions {
        template: &settings.translation_prompt,
        source_language_name: &language_name_or_code(&source.0),
        source_language_code: &source.0,
        target_language_name: &language_name_or_code(&target.0),
        target_language_code: &target.0,
        text: text,
    });

    GenerationRequest {
        model_id,
        system_prompt: settings.system_prompt.clone(),
        prompt: generation_prompt,
        history: Vec::new(),
    }
}

pub enum TranslationStreamEvent {
    Delta { request_id: u32, full_text: String },
    Finished { request_id: u32, full_text: String },
    Cancelled { request_id: u32 },
    Failed { request_id: u32, message: String },
}

const TRANSLATION_STREAM_EVENT: &str = "translation-stream-event";

fn emit_translation_stream_event(app: &AppHandle, payload: TranslationStreamEvent) {
    let payload: TranslationStreamEventDto = payload.into();

    if let Err(e) = app.emit(TRANSLATION_STREAM_EVENT, payload) {
        log::warn!("Some translation event was not sent: {e:?}");
    };
}

async fn stream_translation_text(app: AppHandle, request_id: u32, mut stream: GenerationStream) {
    let mut result = String::new();

    while let Some(event) = stream.next().await {
        match event {
            GenerationEvent::Delta(delta) => {
                result.push_str(&delta);
                emit_translation_stream_event(
                    &app,
                    TranslationStreamEvent::Delta {
                        request_id,
                        full_text: result.clone(),
                    },
                );
            }
            GenerationEvent::Finished(full_text) => {
                if let Some(full_text) = full_text {
                    result = full_text;
                }
                emit_translation_stream_event(
                    &app,
                    TranslationStreamEvent::Finished {
                        request_id,
                        full_text: result,
                    },
                );

                break;
            }
            GenerationEvent::Error(message) => {
                log::warn!("An error occurred during translation: {message}");
                emit_translation_stream_event(
                    &app,
                    TranslationStreamEvent::Failed {
                        request_id,
                        message,
                    },
                );

                break;
            }
        }
    }
}
