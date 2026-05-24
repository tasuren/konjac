use tauri::Manager;
use tokio::sync::Mutex;

use crate::translation::TranslationService;

mod ipc;
mod ipc_dto;
mod language;
mod llm;
mod prompt;
mod settings;
mod translation;

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let settings =
        settings::ensure_settings_available(app).expect("Failed to ensure `settings.json`");
    app.manage(TranslationService::new(&settings));
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
            ipc::get_theme,
            ipc::set_theme
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
