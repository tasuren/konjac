use tauri::{Manager, async_runtime};
use tauri_plugin_log::log;
use tokio::sync::Mutex;

use crate::{
    settings::{ModelSelection, write_settings},
    translation::TranslationService,
};

mod ipc;
mod ipc_dto;
mod language;
mod llm;
mod prompt;
mod settings;
mod translation;

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut settings =
        settings::ensure_settings_available(app).expect("Failed to ensure `settings.json`");
    let translation = TranslationService::new(&settings);

    if settings.model.is_none() {
        match &async_runtime::block_on(translation.list_models()) {
            Ok(models) if let Some(first) = models.iter().nth(0) => {
                settings.model = Some(ModelSelection {
                    id: first.id.clone(),
                    provider: first.provider.clone().into(),
                });

                if let Err(e) = async_runtime::block_on(write_settings(app.app_handle(), &settings))
                {
                    log::warn!("Failed to write settings: {}", e);
                };
            }
            Ok(_) => {}
            Err(e) => log::warn!("Failed to get available models to set default model: {}", e),
        };
    }

    app.manage(translation);
    app.manage(Mutex::new(settings));

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(setup)
        .invoke_handler(tauri::generate_handler![
            ipc::next_translation_request_id,
            ipc::request_translation,
            ipc::list_supported_languages,
            ipc::list_available_languages,
            ipc::list_available_models,
            ipc::to_markdown,
            ipc::get_settings,
            ipc::save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
