use tauri::Manager;

use crate::translation::TranslationService;

mod ipc;
mod ipc_dto;
mod language;
mod llm;
mod prompt;
mod settings;
mod translation;

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let settings = settings::setup(app);
    app.manage(TranslationService::new(&settings));
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
            ipc::list_languages,
            ipc::list_models,
            ipc::to_markdown
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
