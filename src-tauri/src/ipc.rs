use tauri::{AppHandle, State};
use tokio::sync::Mutex;

use crate::{
    ipc_dto::{
        LanguageInfoDto, ModelDto, SettingsDto, TranslationRequestDto, TranslationRequestResultDto,
    },
    language::{COMMON_LANGUAGES, SELECTABLE_LANGUAGES},
    settings::{Settings, write_settings},
    translation::TranslationService,
};

#[tauri::command]
pub async fn request_translation(
    app: AppHandle,
    service: State<'_, TranslationService>,
    request: TranslationRequestDto,
) -> Result<TranslationRequestResultDto, String> {
    let source = service
        .request_translation(app, request.into())
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
pub fn list_languages() -> Vec<LanguageInfoDto> {
    SELECTABLE_LANGUAGES
        .into_iter()
        .map(LanguageInfoDto::from_app_language)
        .collect()
}

#[tauri::command]
pub fn list_common_languages() -> Vec<LanguageInfoDto> {
    COMMON_LANGUAGES
        .into_iter()
        .map(LanguageInfoDto::from_app_language)
        .collect()
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
    crate::markdown::html_to_markdown(&html).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_settings(settings: State<'_, Mutex<Settings>>) -> Result<SettingsDto, String> {
    Ok(settings.lock().await.clone().into())
}

#[tauri::command]
pub async fn save_settings(
    app: AppHandle,
    app_settings_state: State<'_, Mutex<Settings>>,
    settings: SettingsDto,
) -> Result<(), String> {
    let mut app_settings = app_settings_state.lock().await;
    *app_settings = Settings::from(settings);

    write_settings(&app, &app_settings)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn default_translation_prompt() -> String {
    crate::settings::default_translation_prompt()
}
