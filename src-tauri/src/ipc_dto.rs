//! DTO implementation for IPC.

mod language;

use serde::{Deserialize, Serialize};

pub use language::*;

use crate::{
    llm::{Model, ProviderKind},
    settings::{
        ModelSelection, OllamaSettings, ProviderKindSetting, ProviderSettings, Settings,
        ThemeSetting,
    },
};

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ProviderKindDto {
    Ollama,
}

impl From<ProviderKind> for ProviderKindDto {
    fn from(value: ProviderKind) -> Self {
        match value {
            ProviderKind::Ollama => Self::Ollama,
        }
    }
}

impl From<ProviderKindDto> for ProviderKind {
    fn from(value: ProviderKindDto) -> Self {
        match value {
            ProviderKindDto::Ollama => Self::Ollama,
        }
    }
}

impl From<ProviderKindSetting> for ProviderKindDto {
    fn from(value: ProviderKindSetting) -> Self {
        match value {
            ProviderKindSetting::Ollama => Self::Ollama,
        }
    }
}

impl From<ProviderKindDto> for ProviderKindSetting {
    fn from(value: ProviderKindDto) -> Self {
        match value {
            ProviderKindDto::Ollama => Self::Ollama,
        }
    }
}

#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ModelDto {
    pub provider: ProviderKindDto,
    pub id: String,
    pub display_name: Option<String>,
}

impl From<Model> for ModelDto {
    fn from(value: Model) -> Self {
        Self {
            provider: value.provider.into(),
            id: value.id,
            display_name: value.display_name,
        }
    }
}

#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct TranslationRequestDto {
    pub request_id: u32,
    pub provider: ProviderKindDto,
    pub model_id: String,
    pub source_language: SourceLanguageDto,
    pub target_language: TargetLanguageDto,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct TranslationRequestResultDto {
    pub resolved_source_language: ResolvedSourceLanguageDto,
}

/// Translation stream event sent to the frontend.
#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[serde(
    tag = "type",
    rename_all = "snake_case",
    rename_all_fields = "camelCase"
)]
#[ts(export)]
pub enum TranslationStreamEventDto {
    Delta { request_id: u32, full_text: String },
    Finished { request_id: u32, full_text: String },
    Cancelled { request_id: u32 },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ThemeSettingDto {
    Light,
    Dark,
    System,
}

impl From<ThemeSetting> for ThemeSettingDto {
    fn from(value: ThemeSetting) -> Self {
        match value {
            ThemeSetting::Dark => Self::Dark,
            ThemeSetting::Light => Self::Light,
            ThemeSetting::System => Self::System,
        }
    }
}

impl From<ThemeSettingDto> for ThemeSetting {
    fn from(value: ThemeSettingDto) -> Self {
        match value {
            ThemeSettingDto::Dark => Self::Dark,
            ThemeSettingDto::Light => Self::Light,
            ThemeSettingDto::System => Self::System,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SettingsDto {
    pub theme: ThemeSettingDto,

    pub providers: ProviderSettingsDto,
    pub model: Option<ModelSelectionDto>,

    pub default_source_language: SourceLanguageSettingDto,
    pub default_target_language: TargetLanguageSettingDto,
    pub language_list_scope: LanguageListScopeSettingDto,
    pub custom_language_list_scope: Vec<LanguageCodeDto>,
    pub auto_detection: AutoDetectionSettingsDto,

    pub system_prompt: Option<String>,
    pub translation_prompt: String,
}

impl From<Settings> for SettingsDto {
    fn from(value: Settings) -> Self {
        Self {
            theme: value.theme.into(),
            providers: value.providers.into(),
            model: value.model.map(Into::into),
            default_source_language: value.default_source_language.into(),
            default_target_language: value.default_target_language.into(),
            language_list_scope: value.language_list_scope.into(),
            custom_language_list_scope: value
                .custom_language_list_scope
                .into_iter()
                .map(Into::into)
                .collect(),
            auto_detection: value.auto_detection.into(),
            system_prompt: value.system_prompt,
            translation_prompt: value.translation_prompt,
        }
    }
}

impl From<SettingsDto> for Settings {
    fn from(value: SettingsDto) -> Self {
        Self {
            version: Settings::default().version,
            theme: value.theme.into(),
            providers: value.providers.into(),
            model: value.model.map(Into::into),
            default_source_language: value.default_source_language.into(),
            default_target_language: value.default_target_language.into(),
            language_list_scope: value.language_list_scope.into(),
            custom_language_list_scope: value
                .custom_language_list_scope
                .into_iter()
                .map(Into::into)
                .collect(),
            auto_detection: value.auto_detection.into(),
            system_prompt: value.system_prompt,
            translation_prompt: value.translation_prompt,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ProviderSettingsDto {
    pub ollama: OllamaSettingsDto,
}

impl From<ProviderSettings> for ProviderSettingsDto {
    fn from(value: ProviderSettings) -> Self {
        Self {
            ollama: value.ollama.into(),
        }
    }
}

impl From<ProviderSettingsDto> for ProviderSettings {
    fn from(value: ProviderSettingsDto) -> Self {
        Self {
            ollama: value.ollama.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct OllamaSettingsDto {
    pub base_url: String,
    pub keep_alive: Option<String>,
}

impl From<OllamaSettings> for OllamaSettingsDto {
    fn from(value: OllamaSettings) -> Self {
        Self {
            base_url: value.base_url,
            keep_alive: value.keep_alive,
        }
    }
}

impl From<OllamaSettingsDto> for OllamaSettings {
    fn from(value: OllamaSettingsDto) -> Self {
        Self {
            base_url: value.base_url,
            keep_alive: value.keep_alive,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ModelSelectionDto {
    pub provider: ProviderKindDto,
    pub id: String,
}

impl From<ModelSelection> for ModelSelectionDto {
    fn from(value: ModelSelection) -> Self {
        Self {
            provider: value.provider.into(),
            id: value.id,
        }
    }
}

impl From<ModelSelectionDto> for ModelSelection {
    fn from(value: ModelSelectionDto) -> Self {
        Self {
            id: value.id,
            provider: value.provider.into(),
        }
    }
}
