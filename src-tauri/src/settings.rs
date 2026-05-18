use std::{
    fs::File,
    io::{BufReader, BufWriter},
    path::Path,
};

use anyhow::Context;
use lingua::Language;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri_plugin_log::log;

use crate::language::{LanguageDetectionScope, LanguageInfo};

pub fn setup(app: &tauri::App) -> Settings {
    ensure_settings_available(app).expect("Failed to ensure `settings.json`")
}

fn ensure_settings_available(app: &tauri::App) -> anyhow::Result<Settings> {
    let app_config_path = app
        .path()
        .app_config_dir()
        .context("Failed to get the configuration directory path")?;
    let path = app_config_path.join("settings.json");

    if !path.exists() {
        if !app_config_path.exists() {
            std::fs::create_dir_all(app_config_path)
                .context("Failed to create the application configuration directory")?;
        }

        let settings = Settings::default();
        let file = File::create(path)
            .map(BufWriter::new)
            .context("Failed to create `settings.json`")?;
        serde_json::to_writer_pretty(file, &settings)?;
        return Ok(settings);
    }

    let file = std::fs::File::open(&path)
        .map(BufReader::new)
        .context("Failed to open the configuration file")?;

    match serde_json::from_reader(file) {
        Ok(settings) => Ok(settings),
        Err(e) => {
            log::warn!("Failed to parse `settings.json`: {e:?}");
            recreate_settings_file(&app_config_path, &path)
                .context("Failed to recreate settings file")
        }
    }
}

fn recreate_settings_file(
    app_config_path: &Path,
    settings_path: &Path,
) -> std::io::Result<Settings> {
    let backup_file_path = app_config_path.join("settings.backup.json");
    std::fs::copy(&settings_path, &backup_file_path)?;
    log::info!("Created a backup: {}", backup_file_path.display());

    let settings = Settings::default();
    let file = std::fs::File::create(&settings_path).map(BufWriter::new)?;
    serde_json::to_writer_pretty(file, &settings)?;
    log::info!("Recrated the settings file: {}", settings_path.display());

    Ok(settings)
}

const SETTINGS_VERSION: u32 = 0;

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub version: u32,

    pub providers: ProviderSettings,
    pub last_selected_model: Option<ModelSelection>,

    pub default_source_language: SourceLanguageSetting,
    pub default_target_language: TargetLanguageSetting,
    pub auto_detection_settings: AutoDetectionSettings,

    pub system_prompt: Option<String>,
    #[serde(default = "default_translation_prompt")]
    pub translation_prompt: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            version: SETTINGS_VERSION,
            providers: ProviderSettings::default(),
            last_selected_model: None,
            default_source_language: SourceLanguageSetting::AutoDetect,
            default_target_language: TargetLanguageSetting::default(),
            auto_detection_settings: AutoDetectionSettings::default(),
            system_prompt: None,
            translation_prompt: default_translation_prompt(),
        }
    }
}

fn default_translation_prompt() -> String {
    include_str!("default_translation_prompt.md").to_owned()
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum SourceLanguageSetting {
    AutoDetect,
    Manual(LanguageInfoSetting),
}

#[derive(Default, Serialize, Deserialize)]
pub struct TargetLanguageSetting(LanguageInfoSetting);

#[derive(Clone, Serialize, Deserialize)]
pub struct LanguageInfoSetting {
    pub name: String,
    pub code: String,
}

impl Default for LanguageInfoSetting {
    fn default() -> Self {
        Self {
            name: "English".to_owned(),
            code: "en".to_owned(),
        }
    }
}

impl From<LanguageInfoSetting> for LanguageInfo {
    fn from(value: LanguageInfoSetting) -> Self {
        Self {
            name: value.name,
            code: value.code,
        }
    }
}

#[derive(Default, Clone, Serialize, Deserialize)]
pub enum LanguageDetectionScopeSetting {
    #[default]
    Common,
    All,
    Custom(Vec<Language>),
}

impl From<LanguageDetectionScopeSetting> for LanguageDetectionScope {
    fn from(value: LanguageDetectionScopeSetting) -> Self {
        match value {
            LanguageDetectionScopeSetting::All => Self::All,
            LanguageDetectionScopeSetting::Common => Self::Common,
            LanguageDetectionScopeSetting::Custom(languages) => Self::Custom(languages),
        }
    }
}

#[derive(Default, Clone, Serialize, Deserialize)]
pub struct AutoDetectionSettings {
    pub scope: LanguageDetectionScopeSetting,
    pub fallback_to: LanguageInfoSetting,
}

#[derive(Default, Serialize, Deserialize)]
pub struct ProviderSettings {
    pub ollama: OllamaSettings,
}

#[derive(Serialize, Deserialize)]
pub struct OllamaSettings {
    #[serde(default = "ollama_default_base_url")]
    pub base_url: String,
}

impl Default for OllamaSettings {
    fn default() -> Self {
        Self {
            base_url: ollama_default_base_url(),
        }
    }
}

fn ollama_default_base_url() -> String {
    "http://127.0.0.1:11434".to_owned()
}

#[derive(Serialize, Deserialize)]
pub struct ModelSelection {
    pub model_name: String,
    pub provider: ProviderKindSetting,
}

#[derive(PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ProviderKindSetting {
    Ollama,
}
