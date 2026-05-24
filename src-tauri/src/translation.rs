use std::sync::atomic;

use futures_util::StreamExt;
use lingua::Language;
use tauri::async_runtime::JoinHandle;
use tauri_plugin_log::log;
use tokio::sync::Mutex;

use crate::{
    ipc_dto::{TranslationRequestDto, TranslationStreamEventDto},
    language::{
        LanguageInfo, LanguageResolver, ResolvedLanguagePair, ResolvedSourceLanguage,
        SourceLanguage, TargetLanguage,
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
        let language_resolver = LanguageResolver::new(
            settings.auto_detection_settings.scope.clone().into(),
            settings.auto_detection_settings.fallback_to.clone().into(),
        );
        let providers =
            LlmProviders::new(&settings.providers).expect("Failed to create LLM providers.");
        let settings = TranslationSettings {
            system_prompt: settings.system_prompt.clone(),
            translation_prompt: settings.translation_prompt.clone(),
        };
        let task_store = TranslationTaskStore::new();

        Self {
            request_id_store,
            language_resolver: Mutex::new(language_resolver),
            providers: Mutex::new(providers),
            settings: Mutex::new(settings),
            task_store: Mutex::new(task_store),
        }
    }

    pub fn next_request_id(&self) -> u32 {
        self.request_id_store.next()
    }

    pub async fn request_translation(
        &self,
        request: TranslationRequest,
        emitter: Box<dyn TranslationResponseEmitter>,
    ) -> anyhow::Result<ResolvedSourceLanguage> {
        let mut task_store = self.task_store.lock().await;
        task_store.abort_latest_task(&*emitter);

        let ResolvedLanguagePair { source, target } = self.language_resolver.lock().await.resolve(
            request.source_language.into(),
            request.target_language.into(),
            &request.text,
        );

        let generation_request = build_generation_request(
            &*self.settings.lock().await,
            source.get_language_info(),
            target.get_language_info(),
            &request.text,
            request.model_id,
        )
        .await;

        let stream = {
            let lock = self.providers.lock().await;
            lock.generate_stream(request.provider, generation_request)
                .await?
        };

        let handle = tauri::async_runtime::spawn(async move {
            stream_translation_text(&*emitter, request.request_id, stream).await;
        });
        task_store.set_latest_task(request.request_id, handle);

        Ok(source)
    }

    pub async fn list_models(&self) -> anyhow::Result<Vec<Model>> {
        self.providers.lock().await.list_models().await
    }

    pub fn list_languages(&self) -> Vec<Language> {
        Language::all().into_iter().map(Into::into).collect()
    }
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

pub struct TranslationSettings {
    system_prompt: Option<String>,
    translation_prompt: String,
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

    fn abort_latest_task(&mut self, emitter: &dyn TranslationResponseEmitter) {
        if let Some(task) = self.latest_task.take() {
            task.handle.abort();
            emitter.emit(TranslationStreamEvent::Cancelled {
                request_id: task.request_id,
            });
        }
    }
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

pub enum TranslationStreamEvent {
    Delta { request_id: u32, full_text: String },
    Finished { request_id: u32, full_text: String },
    Cancelled { request_id: u32 },
}

impl From<TranslationStreamEvent> for TranslationStreamEventDto {
    fn from(value: TranslationStreamEvent) -> Self {
        match value {
            TranslationStreamEvent::Delta {
                request_id,
                full_text,
            } => Self::Delta {
                request_id,
                full_text,
            },
            TranslationStreamEvent::Finished {
                request_id,
                full_text,
            } => Self::Finished {
                request_id,
                full_text,
            },
            TranslationStreamEvent::Cancelled { request_id } => Self::Cancelled { request_id },
        }
    }
}

pub trait TranslationResponseEmitter: Send + Sync {
    fn emit(&self, payload: TranslationStreamEvent);
}

async fn stream_translation_text(
    emitter: &dyn TranslationResponseEmitter,
    request_id: u32,
    mut stream: GenerationStream,
) {
    let mut result = String::new();

    while let Some(event) = stream.next().await {
        match event {
            GenerationEvent::Delta(delta) => {
                result.push_str(&delta);
                emitter.emit(TranslationStreamEvent::Delta {
                    request_id,
                    full_text: result.clone(),
                });
            }
            GenerationEvent::Finished(full_text) => {
                if let Some(full_text) = full_text {
                    result = full_text;
                }
                emitter.emit(TranslationStreamEvent::Finished {
                    request_id,
                    full_text: result,
                });

                break;
            }
            GenerationEvent::Error(message) => {
                log::warn!("An error occurred during translation: {message}");
            }
        }
    }
}
