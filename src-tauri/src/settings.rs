use std::{
    fs::File,
    io::{BufReader, BufWriter},
    path::Path,
    str::FromStr,
};

use anyhow::Context;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri_plugin_log::log;

use crate::{
    language::{COMMON_LANGUAGES, DetectableLanguage, LanguageCode, LanguageDetectionScope},
    llm::ProviderKind,
};

pub fn ensure_settings_available(app: &tauri::App) -> anyhow::Result<Settings> {
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

pub async fn write_settings(app: &tauri::AppHandle, settings: &Settings) -> anyhow::Result<()> {
    let settings_path = app
        .path()
        .app_config_dir()
        .context("Failed to get the configuration directory path")?
        .join("settings.json");

    let data = serde_json::to_vec_pretty(settings)?;
    tokio::fs::write(&settings_path, data)
        .await
        .context("Failed to write settings file")?;
    log::debug!("Wrote settings: {}", settings_path.display());

    Ok(())
}

const SETTINGS_VERSION: u32 = 0;

#[derive(Clone, Serialize, Deserialize)]
pub struct Settings {
    pub version: u32,

    pub theme: ThemeSetting,
    pub app_locale: AppLocaleSetting,
    pub quick_copy_translate: QuickCopyTranslateSettings,

    pub providers: ProviderSettings,
    pub model: Option<ModelSelection>,

    pub default_source_language: SourceLanguageSetting,
    pub default_target_language: TargetLanguageSetting,
    pub fallback_target_language: TargetLanguageSetting,
    pub language_list_scope: LanguageListScopeSetting,
    pub custom_language_list_scope: Vec<LanguageCode>,
    pub auto_detection: AutoDetectionSettings,

    pub system_prompt: Option<String>,
    #[serde(default = "default_translation_prompt")]
    pub translation_prompt: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            version: SETTINGS_VERSION,
            theme: ThemeSetting::default(),
            app_locale: AppLocaleSetting::default(),
            quick_copy_translate: QuickCopyTranslateSettings::default(),
            providers: ProviderSettings::default(),
            model: None,
            default_source_language: SourceLanguageSetting::default(),
            default_target_language: TargetLanguageSetting::default(),
            fallback_target_language: TargetLanguageSetting::default(),
            language_list_scope: LanguageListScopeSetting::default(),
            custom_language_list_scope: COMMON_LANGUAGES
                .iter()
                .map(|l| LanguageCode(l.code.to_owned()))
                .collect::<Vec<_>>(),
            auto_detection: AutoDetectionSettings::default(),
            system_prompt: None,
            translation_prompt: default_translation_prompt(),
        }
    }
}

/// Settings for opening translation from repeated copy shortcuts.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct QuickCopyTranslateSettings {
    pub enabled: bool,
    pub double_press_interval_ms: u64,
    pub pasteboard_wait_ms: u64,
}

impl Default for QuickCopyTranslateSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            double_press_interval_ms: 500,
            pasteboard_wait_ms: 150,
        }
    }
}

#[derive(Default, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ThemeSetting {
    Light,
    Dark,
    #[default]
    System,
}

#[derive(Default, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AppLocaleSetting {
    /// Resolve the UI language from the system/browser language list.
    #[default]
    System,
    Ja,
    En,
    #[serde(rename = "zh-CN")]
    ZhCn,
}

pub fn default_translation_prompt() -> String {
    include_str!("default_translation_prompt.md").to_owned()
}

#[derive(Default, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SourceLanguageSetting {
    #[default]
    AutoDetect,
    Manual {
        code: LanguageCode,
    },
}

#[derive(Default, Clone, Serialize, Deserialize)]
pub struct TargetLanguageSetting(pub LanguageCode);

#[derive(Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LanguageListScopeSetting {
    #[default]
    All,
    Common,
    Custom,
}

#[derive(Default, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LanguageDetectionScopeSetting {
    All,
    #[default]
    Common,
    Custom,
}

impl From<LanguageDetectionScopeSetting> for LanguageDetectionScope {
    fn from(value: LanguageDetectionScopeSetting) -> Self {
        match value {
            LanguageDetectionScopeSetting::All => Self::All,
            LanguageDetectionScopeSetting::Common => Self::Common,
            LanguageDetectionScopeSetting::Custom => Self::Custom,
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AutoDetectionSettings {
    pub scope: LanguageDetectionScopeSetting,
    pub custom_detection_scope: Vec<DetectableLanguage>,
    pub fallback_to: LanguageCode,
}

impl Default for AutoDetectionSettings {
    fn default() -> Self {
        Self {
            scope: LanguageDetectionScopeSetting::default(),
            custom_detection_scope: COMMON_LANGUAGES
                .iter()
                .filter_map(|l| DetectableLanguage::from_str(l.code).ok())
                .collect(),
            fallback_to: LanguageCode::default(),
        }
    }
}

#[derive(Default, Clone, Serialize, Deserialize)]
pub struct ProviderSettings {
    pub ollama: OllamaSettings,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct OllamaSettings {
    #[serde(default = "ollama_default_base_url")]
    pub base_url: String,
    pub keep_alive: Option<String>,
}

impl Default for OllamaSettings {
    fn default() -> Self {
        Self {
            base_url: ollama_default_base_url(),
            keep_alive: None,
        }
    }
}

fn ollama_default_base_url() -> String {
    "http://127.0.0.1:11434".to_owned()
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ModelSelection {
    pub id: String,
    pub provider: ProviderKindSetting,
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ProviderKindSetting {
    Ollama,
}

impl From<ProviderKind> for ProviderKindSetting {
    fn from(value: ProviderKind) -> Self {
        match value {
            ProviderKind::Ollama => Self::Ollama,
        }
    }
}

impl From<ProviderKindSetting> for ProviderKind {
    fn from(value: ProviderKindSetting) -> Self {
        match value {
            ProviderKindSetting::Ollama => Self::Ollama,
        }
    }
}
