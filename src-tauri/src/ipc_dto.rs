//! DTO implementation for IPC.

use serde::{Deserialize, Serialize};

use crate::{
    language::{LanguageInfo, ResolvedSourceLanguage, SourceLanguage, TargetLanguage},
    llm::{Model, ProviderKind},
    settings::ThemeSetting,
};

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
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

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct LanguageInfoDto {
    pub name: String,
    pub code: String,
}

impl From<LanguageInfoDto> for LanguageInfo {
    fn from(value: LanguageInfoDto) -> Self {
        Self {
            name: value.name,
            code: value.code,
        }
    }
}

impl From<LanguageInfo> for LanguageInfoDto {
    fn from(value: LanguageInfo) -> Self {
        Self {
            name: value.name,
            code: value.code,
        }
    }
}

impl From<lingua::Language> for LanguageInfoDto {
    fn from(value: lingua::Language) -> Self {
        Self {
            name: value.to_string(),
            code: value.iso_code_639_1().to_string(),
        }
    }
}

#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum SourceLanguageDto {
    AutoDetect,
    Manual(LanguageInfoDto),
}

impl From<SourceLanguageDto> for SourceLanguage {
    fn from(value: SourceLanguageDto) -> Self {
        match value {
            SourceLanguageDto::AutoDetect => Self::AutoDetect,
            SourceLanguageDto::Manual(lang) => Self::Manual(lang.into()),
        }
    }
}

#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct TargetLanguageDto(pub LanguageInfoDto);

impl From<TargetLanguageDto> for TargetLanguage {
    fn from(value: TargetLanguageDto) -> Self {
        Self(value.0.into())
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
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum ResolvedSourceLanguageDto {
    Detected(LanguageInfoDto),
    Assumed(LanguageInfoDto),
    Manual(LanguageInfoDto),
}

impl From<ResolvedSourceLanguage> for ResolvedSourceLanguageDto {
    fn from(value: ResolvedSourceLanguage) -> Self {
        match value {
            ResolvedSourceLanguage::Assumed(lang) => Self::Assumed(lang.into()),
            ResolvedSourceLanguage::Detected(lang) => Self::Detected(lang.into()),
            ResolvedSourceLanguage::Manual(lang) => Self::Manual(lang.into()),
        }
    }
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
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
#[ts(export)]
pub enum TranslationStreamEventDto {
    Delta { request_id: u32, full_text: String },
    Finished { request_id: u32, full_text: String },
    Cancelled { request_id: u32 },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum ThemeDto {
    Light,
    Dark,
    System,
}

impl From<ThemeSetting> for ThemeDto {
    fn from(value: ThemeSetting) -> Self {
        match value {
            ThemeSetting::Dark => Self::Dark,
            ThemeSetting::Light => Self::Light,
            ThemeSetting::System => Self::System,
        }
    }
}

impl From<ThemeDto> for ThemeSetting {
    fn from(value: ThemeDto) -> Self {
        match value {
            ThemeDto::Dark => Self::Dark,
            ThemeDto::Light => Self::Light,
            ThemeDto::System => Self::System,
        }
    }
}
