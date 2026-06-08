use tauri::{AppHandle, State};
use tokio::sync::Mutex;

use crate::{
    ipc_dto::{
        LanguageInfoDto, ModelDto, ProviderKindDto, ProviderSettingsDto, SettingsDto,
        TranslationRequestDto, TranslationRequestResultDto,
    },
    language::{COMMON_LANGUAGES, SELECTABLE_LANGUAGES},
    llm,
    quick_copy_translate::QuickCopyTranslateService,
    settings::{Settings, write_settings},
    translation::TranslationService,
};

#[tauri::command]
pub async fn request_translation(
    app: AppHandle,
    service: State<'_, TranslationService>,
    request: TranslationRequestDto,
) -> Result<TranslationRequestResultDto, String> {
    let (source, target) = service
        .request_translation(app, request.into())
        .await
        .map_err(|e| e.to_string())?;

    Ok(TranslationRequestResultDto {
        resolved_source_language: source.into(),
        resolved_target_language: target.into(),
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
pub async fn list_provider_models(
    provider: ProviderKindDto,
    settings: ProviderSettingsDto,
) -> Result<Vec<ModelDto>, String> {
    let provider = provider.into();
    let settings = settings.into();

    llm::list_provider_models(provider, &settings)
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
    translation: State<'_, TranslationService>,
    quick_copy: State<'_, QuickCopyTranslateService>,
    settings: SettingsDto,
) -> Result<(), String> {
    let next_settings = Settings::from(settings);

    quick_copy
        .apply_settings(app.clone(), &next_settings.quick_copy_translate)
        .await
        .map_err(|e| e.to_string())?;
    translation
        .apply_settings(&next_settings)
        .await
        .map_err(|e| e.to_string())?;

    {
        let mut app_settings = app_settings_state.lock().await;
        *app_settings = next_settings.clone();
    }

    write_settings(&app, &next_settings)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn default_translation_prompt() -> String {
    crate::settings::default_translation_prompt()
}
