//! DTO implementation for IPC.

use serde::{Deserialize, Serialize};

use crate::language::{LanguageInfo, ResolvedSourceLanguage, SourceLanguage, TargetLanguage};

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum ProviderKindDto {
    Ollama,
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
