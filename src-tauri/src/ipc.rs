use lingua::Language;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_log::log;
use tokio::sync::Mutex;

use crate::{
    ipc_dto::{
        LanguageInfoDto, ModelDto, ThemeDto, TranslationRequestDto, TranslationRequestResultDto,
        TranslationStreamEventDto,
    },
    language::COMMON_LANGUAGES,
    settings::{LanguageListScopeSetting, Settings, write_settings},
    translation::{TranslationResponseEmitter, TranslationService, TranslationStreamEvent},
};

pub struct TranslationStream(AppHandle);

impl TranslationResponseEmitter for TranslationStream {
    fn emit(&self, payload: TranslationStreamEvent) {
        let payload: TranslationStreamEventDto = payload.into();

        if let Err(e) = self.0.emit("translation-stream-event", payload) {
            log::warn!("Some translation event was not sent: {e:?}");
        };
    }
}

#[tauri::command]
pub async fn request_translation(
    app: AppHandle,
    service: State<'_, TranslationService>,
    request: TranslationRequestDto,
) -> Result<TranslationRequestResultDto, String> {
    let source = service
        .request_translation(request.into(), Box::new(TranslationStream(app)))
        .await
        .map_err(|e| e.to_string())?;

    Ok(TranslationRequestResultDto {
        resolved_source_language: source.into(),
    })
}

#[tauri::command]
pub fn next_translation_request_id(service: State<'_, TranslationService>) -> u32 {
    service.next_request_id()
}

#[tauri::command]
pub fn list_supported_languages() -> Vec<LanguageInfoDto> {
    Language::all().into_iter().map(Into::into).collect()
}

#[tauri::command]
pub async fn list_available_languages(
    settings: State<'_, Mutex<Settings>>,
) -> Result<Vec<LanguageInfoDto>, ()> {
    Ok(match &settings.lock().await.language_list_scope {
        LanguageListScopeSetting::All => Language::all().into_iter().map(Into::into).collect(),
        LanguageListScopeSetting::Common => {
            COMMON_LANGUAGES.iter().cloned().map(Into::into).collect()
        }
        LanguageListScopeSetting::Custom(languages) => {
            languages.iter().cloned().map(Into::into).collect()
        }
    })
}

#[tauri::command]
pub async fn list_available_models(
    service: State<'_, TranslationService>,
) -> Result<Vec<ModelDto>, String> {
    service
        .list_models()
        .await
        .map(|models| models.into_iter().map(Into::into).collect())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn to_markdown(html: String) -> Result<String, String> {
    let converter = htmd::HtmlToMarkdownBuilder::new()
        .skip_tags(vec![
            "script", "style", "iframe", "object", "embed", "canvas", "svg", "noscript",
        ])
        .build();

    converter.convert(&html).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_theme(settings: State<'_, Mutex<Settings>>) -> Result<ThemeDto, ()> {
    Ok(settings.lock().await.theme.into())
}

#[tauri::command]
pub async fn set_theme(
    app: AppHandle,
    settings: State<'_, Mutex<Settings>>,
    theme: ThemeDto,
) -> Result<(), String> {
    let mut settings = settings.lock().await;
    settings.theme = theme.into();
    write_settings(&app, &settings)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
