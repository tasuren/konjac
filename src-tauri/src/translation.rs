use futures_util::StreamExt;
use tauri_plugin_log::log;
use tokio::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
    ipc_dto::{
        ProviderKindDto, ResolvedSourceLanguageDto, TranslationEventDto, TranslationRequestDto,
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
    app.manage(Mutex::new(LlmProviders::new(&settings.providers)));
    app.manage(Mutex::new(TranslationSettings {
        system_prompt: settings.system_prompt.clone(),
        translation_prompt: settings.translation_prompt.clone(),
    }));
}

pub struct LlmProviders {
    pub ollama: OllamaProvider,
}

impl LlmProviders {
    pub fn new(settings: &ProviderSettings) -> anyhow::Result<Self> {
        Ok(Self {
            ollama: OllamaProvider::new(&settings.ollama.base_url)?,
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

#[tauri::command]
pub async fn translate(
    app: AppHandle,
    providers: State<'_, Mutex<LlmProviders>>,
    language_resolver: State<'_, LanguageResolver>,
    settings: State<'_, TranslationSettings>,
    request: TranslationRequestDto,
) -> Result<ResolvedSourceLanguageDto, String> {
    let ResolvedLanguagePair { source, target } = language_resolver.resolve(
        request.source_language.into(),
        request.target_language.into(),
        &request.text,
    );

    let generation_request = build_generation_request(
        &settings,
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

    tauri::async_runtime::spawn(stream_translation_text(app, request.request_id, stream));

    Ok(source.into())
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
    request_id: u64,
    mut stream: GenerationStream,
) {
    let mut result = String::new();

    let emit = move |event: TranslationEventDto| {
        if let Err(e) = app.emit("translation-stream-event", event) {
            log::warn!("Some translation event was not sent: {e:?}");
        };
    };

    while let Some(event) = stream.next().await {
        match event {
            GenerationEvent::Delta(delta) => {
                result.push_str(&delta);
                emit(TranslationEventDto::Delta {
                    request_id,
                    full_text: result.clone(),
                });
            }
            GenerationEvent::Finished(full_text) => {
                if let Some(full_text) = full_text {
                    result.push_str(&full_text);
                }
                emit(TranslationEventDto::Finished {
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
