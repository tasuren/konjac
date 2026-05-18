//! DTO implementation for IPC.

use serde::{Deserialize, Serialize};

use crate::language::{LanguageInfo, ResolvedSourceLanguage, SourceLanguage, TargetLanguage};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ProviderKindDto {
    Ollama,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Deserialize)]
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

#[derive(Debug, Clone, Deserialize)]
pub struct TargetLanguageDto(pub LanguageInfoDto);

impl From<TargetLanguageDto> for TargetLanguage {
    fn from(value: TargetLanguageDto) -> Self {
        Self(value.0.into())
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranslationRequestDto {
    pub request_id: u64,
    pub provider: ProviderKindDto,
    pub model_id: String,
    pub source_language: SourceLanguageDto,
    pub target_language: TargetLanguageDto,
    pub text: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
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

/// Translation stream event sent to the frontend.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum TranslationEventDto {
    Delta { request_id: u64, full_text: String },
    Finished { request_id: u64, full_text: String },
}
