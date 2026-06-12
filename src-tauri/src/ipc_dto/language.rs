//! Language-related DTOs for IPC.

use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::{
    language::{
        DetectableLanguage, LanguageCode, ResolvedSourceLanguage, ResolvedTargetLanguage,
        SourceLanguage, TargetLanguage,
    },
    settings::{
        LanguageDetectionScopeSetting, LanguageDetectionSettings, LanguageListScopeSetting,
        SourceLanguageSetting, TargetLanguageSetting,
    },
};

/// Language metadata shared with the frontend for display and translation choices.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct LanguageInfoDto {
    pub name: String,
    pub code: String,
    pub detectable: bool,
}

impl LanguageInfoDto {
    pub fn from_app_language(language: &crate::language::AppLanguage) -> Self {
        Self {
            name: language.name.to_owned(),
            code: language.code.to_owned(),
            detectable: language.detectable.is_some(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct LanguageCodeDto(pub String);

impl From<LanguageCode> for LanguageCodeDto {
    fn from(value: LanguageCode) -> Self {
        Self(value.0)
    }
}

impl From<LanguageCodeDto> for LanguageCode {
    fn from(value: LanguageCodeDto) -> Self {
        Self(value.0)
    }
}

/// Source language selection sent with a translation request.
#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[serde(
    tag = "type",
    rename_all = "snake_case",
    rename_all_fields = "camelCase"
)]
#[ts(export)]
pub enum SourceLanguageDto {
    AutoDetect,
    Manual { code: LanguageCodeDto },
}

impl From<SourceLanguageDto> for SourceLanguage {
    fn from(value: SourceLanguageDto) -> Self {
        match value {
            SourceLanguageDto::AutoDetect => Self::AutoDetect,
            SourceLanguageDto::Manual { code } => Self::Manual(code.into()),
        }
    }
}

impl From<SourceLanguage> for SourceLanguageDto {
    fn from(value: SourceLanguage) -> Self {
        match value {
            SourceLanguage::AutoDetect => Self::AutoDetect,
            SourceLanguage::Manual(code) => Self::Manual { code: code.into() },
        }
    }
}

/// Target language selection sent with a translation request.
#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct TargetLanguageDto(pub LanguageCodeDto);

impl From<TargetLanguageDto> for TargetLanguage {
    fn from(value: TargetLanguageDto) -> Self {
        Self(value.0.into())
    }
}

impl From<TargetLanguage> for TargetLanguageDto {
    fn from(value: TargetLanguage) -> Self {
        Self(value.0.into())
    }
}

#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[serde(
    tag = "type",
    rename_all = "snake_case",
    rename_all_fields = "camelCase"
)]
#[ts(export)]
pub enum ResolvedSourceLanguageDto {
    Detected { code: LanguageCodeDto },
    Assumed { code: LanguageCodeDto },
    Manual { code: LanguageCodeDto },
}

impl From<ResolvedSourceLanguage> for ResolvedSourceLanguageDto {
    fn from(value: ResolvedSourceLanguage) -> Self {
        match value {
            ResolvedSourceLanguage::Assumed(code) => Self::Assumed { code: code.into() },
            ResolvedSourceLanguage::Detected(code) => Self::Detected { code: code.into() },

            ResolvedSourceLanguage::Manual(code) => Self::Manual { code: code.into() },
        }
    }
}

#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[ts(export)]
pub struct ResolvedTargetLanguageDto(pub LanguageCodeDto);

impl From<ResolvedTargetLanguage> for ResolvedTargetLanguageDto {
    fn from(value: ResolvedTargetLanguage) -> Self {
        Self(value.0.into())
    }
}

/// Persisted default source language setting.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(
    tag = "type",
    rename_all = "snake_case",
    rename_all_fields = "camelCase"
)]
#[ts(export)]
pub enum SourceLanguageSettingDto {
    AutoDetect,
    Manual { code: LanguageCodeDto },
}

impl From<SourceLanguageSetting> for SourceLanguageSettingDto {
    fn from(value: SourceLanguageSetting) -> Self {
        match value {
            SourceLanguageSetting::AutoDetect => Self::AutoDetect,
            SourceLanguageSetting::Manual { code } => Self::Manual { code: code.into() },
        }
    }
}

impl From<SourceLanguageSettingDto> for SourceLanguageSetting {
    fn from(value: SourceLanguageSettingDto) -> Self {
        match value {
            SourceLanguageSettingDto::AutoDetect => Self::AutoDetect,
            SourceLanguageSettingDto::Manual { code } => Self::Manual { code: code.into() },
        }
    }
}

/// Persisted default target language setting.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct TargetLanguageSettingDto(pub LanguageCodeDto);

impl From<TargetLanguageSetting> for TargetLanguageSettingDto {
    fn from(value: TargetLanguageSetting) -> Self {
        Self(value.0.into())
    }
}

impl From<TargetLanguageSettingDto> for TargetLanguageSetting {
    fn from(value: TargetLanguageSettingDto) -> Self {
        Self(value.0.into())
    }
}

/// Language-list scope for selectable translation languages.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum LanguageListScopeSettingDto {
    All,
    Common,
    Custom,
}

impl From<LanguageListScopeSetting> for LanguageListScopeSettingDto {
    fn from(value: LanguageListScopeSetting) -> Self {
        match value {
            LanguageListScopeSetting::All => Self::All,
            LanguageListScopeSetting::Common => Self::Common,
            LanguageListScopeSetting::Custom => Self::Custom,
        }
    }
}

impl From<LanguageListScopeSettingDto> for LanguageListScopeSetting {
    fn from(value: LanguageListScopeSettingDto) -> Self {
        match value {
            LanguageListScopeSettingDto::All => Self::All,
            LanguageListScopeSettingDto::Common => Self::Common,
            LanguageListScopeSettingDto::Custom => Self::Custom,
        }
    }
}

/// Language that can be used as a Lingua detection candidate.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, ts_rs::TS)]
#[ts(export)]
pub enum DetectableLanguageDto {
    #[serde(rename = "af")]
    Afrikaans,
    #[serde(rename = "sq")]
    Albanian,
    #[serde(rename = "ar")]
    Arabic,
    #[serde(rename = "hy")]
    Armenian,
    #[serde(rename = "az")]
    Azerbaijani,
    #[serde(rename = "eu")]
    Basque,
    #[serde(rename = "be")]
    Belarusian,
    #[serde(rename = "bn")]
    Bengali,
    #[serde(rename = "nb")]
    Bokmal,
    #[serde(rename = "bs")]
    Bosnian,
    #[serde(rename = "bg")]
    Bulgarian,
    #[serde(rename = "ca")]
    Catalan,
    #[serde(rename = "zh")]
    Chinese,
    #[serde(rename = "hr")]
    Croatian,
    #[serde(rename = "cs")]
    Czech,
    #[serde(rename = "da")]
    Danish,
    #[serde(rename = "nl")]
    Dutch,
    #[serde(rename = "en")]
    English,
    #[serde(rename = "eo")]
    Esperanto,
    #[serde(rename = "et")]
    Estonian,
    #[serde(rename = "fi")]
    Finnish,
    #[serde(rename = "fr")]
    French,
    #[serde(rename = "lg")]
    Ganda,
    #[serde(rename = "ka")]
    Georgian,
    #[serde(rename = "de")]
    German,
    #[serde(rename = "el")]
    Greek,
    #[serde(rename = "gu")]
    Gujarati,
    #[serde(rename = "he")]
    Hebrew,
    #[serde(rename = "hi")]
    Hindi,
    #[serde(rename = "hu")]
    Hungarian,
    #[serde(rename = "is")]
    Icelandic,
    #[serde(rename = "id")]
    Indonesian,
    #[serde(rename = "ga")]
    Irish,
    #[serde(rename = "it")]
    Italian,
    #[serde(rename = "ja")]
    Japanese,
    #[serde(rename = "kk")]
    Kazakh,
    #[serde(rename = "ko")]
    Korean,
    #[serde(rename = "la")]
    Latin,
    #[serde(rename = "lv")]
    Latvian,
    #[serde(rename = "lt")]
    Lithuanian,
    #[serde(rename = "mk")]
    Macedonian,
    #[serde(rename = "ms")]
    Malay,
    #[serde(rename = "mi")]
    Maori,
    #[serde(rename = "mr")]
    Marathi,
    #[serde(rename = "mn")]
    Mongolian,
    #[serde(rename = "nn")]
    Nynorsk,
    #[serde(rename = "fa")]
    Persian,
    #[serde(rename = "pl")]
    Polish,
    #[serde(rename = "pt")]
    Portuguese,
    #[serde(rename = "pa")]
    Punjabi,
    #[serde(rename = "ro")]
    Romanian,
    #[serde(rename = "ru")]
    Russian,
    #[serde(rename = "sr")]
    Serbian,
    #[serde(rename = "sn")]
    Shona,
    #[serde(rename = "sk")]
    Slovak,
    #[serde(rename = "sl")]
    Slovene,
    #[serde(rename = "so")]
    Somali,
    #[serde(rename = "st")]
    Sotho,
    #[serde(rename = "es")]
    Spanish,
    #[serde(rename = "sw")]
    Swahili,
    #[serde(rename = "sv")]
    Swedish,
    #[serde(rename = "tl")]
    Tagalog,
    #[serde(rename = "ta")]
    Tamil,
    #[serde(rename = "te")]
    Telugu,
    #[serde(rename = "th")]
    Thai,
    #[serde(rename = "ts")]
    Tsonga,
    #[serde(rename = "tn")]
    Tswana,
    #[serde(rename = "tr")]
    Turkish,
    #[serde(rename = "uk")]
    Ukrainian,
    #[serde(rename = "ur")]
    Urdu,
    #[serde(rename = "vi")]
    Vietnamese,
    #[serde(rename = "cy")]
    Welsh,
    #[serde(rename = "xh")]
    Xhosa,
    #[serde(rename = "yo")]
    Yoruba,
    #[serde(rename = "zu")]
    Zulu,
}

impl From<DetectableLanguage> for DetectableLanguageDto {
    fn from(value: DetectableLanguage) -> Self {
        match value {
            DetectableLanguage::Afrikaans => Self::Afrikaans,
            DetectableLanguage::Albanian => Self::Albanian,
            DetectableLanguage::Arabic => Self::Arabic,
            DetectableLanguage::Armenian => Self::Armenian,
            DetectableLanguage::Azerbaijani => Self::Azerbaijani,
            DetectableLanguage::Basque => Self::Basque,
            DetectableLanguage::Belarusian => Self::Belarusian,
            DetectableLanguage::Bengali => Self::Bengali,
            DetectableLanguage::Bokmal => Self::Bokmal,
            DetectableLanguage::Bosnian => Self::Bosnian,
            DetectableLanguage::Bulgarian => Self::Bulgarian,
            DetectableLanguage::Catalan => Self::Catalan,
            DetectableLanguage::Chinese => Self::Chinese,
            DetectableLanguage::Croatian => Self::Croatian,
            DetectableLanguage::Czech => Self::Czech,
            DetectableLanguage::Danish => Self::Danish,
            DetectableLanguage::Dutch => Self::Dutch,
            DetectableLanguage::English => Self::English,
            DetectableLanguage::Esperanto => Self::Esperanto,
            DetectableLanguage::Estonian => Self::Estonian,
            DetectableLanguage::Finnish => Self::Finnish,
            DetectableLanguage::French => Self::French,
            DetectableLanguage::Ganda => Self::Ganda,
            DetectableLanguage::Georgian => Self::Georgian,
            DetectableLanguage::German => Self::German,
            DetectableLanguage::Greek => Self::Greek,
            DetectableLanguage::Gujarati => Self::Gujarati,
            DetectableLanguage::Hebrew => Self::Hebrew,
            DetectableLanguage::Hindi => Self::Hindi,
            DetectableLanguage::Hungarian => Self::Hungarian,
            DetectableLanguage::Icelandic => Self::Icelandic,
            DetectableLanguage::Indonesian => Self::Indonesian,
            DetectableLanguage::Irish => Self::Irish,
            DetectableLanguage::Italian => Self::Italian,
            DetectableLanguage::Japanese => Self::Japanese,
            DetectableLanguage::Kazakh => Self::Kazakh,
            DetectableLanguage::Korean => Self::Korean,
            DetectableLanguage::Latin => Self::Latin,
            DetectableLanguage::Latvian => Self::Latvian,
            DetectableLanguage::Lithuanian => Self::Lithuanian,
            DetectableLanguage::Macedonian => Self::Macedonian,
            DetectableLanguage::Malay => Self::Malay,
            DetectableLanguage::Maori => Self::Maori,
            DetectableLanguage::Marathi => Self::Marathi,
            DetectableLanguage::Mongolian => Self::Mongolian,
            DetectableLanguage::Nynorsk => Self::Nynorsk,
            DetectableLanguage::Persian => Self::Persian,
            DetectableLanguage::Polish => Self::Polish,
            DetectableLanguage::Portuguese => Self::Portuguese,
            DetectableLanguage::Punjabi => Self::Punjabi,
            DetectableLanguage::Romanian => Self::Romanian,
            DetectableLanguage::Russian => Self::Russian,
            DetectableLanguage::Serbian => Self::Serbian,
            DetectableLanguage::Shona => Self::Shona,
            DetectableLanguage::Slovak => Self::Slovak,
            DetectableLanguage::Slovene => Self::Slovene,
            DetectableLanguage::Somali => Self::Somali,
            DetectableLanguage::Sotho => Self::Sotho,
            DetectableLanguage::Spanish => Self::Spanish,
            DetectableLanguage::Swahili => Self::Swahili,
            DetectableLanguage::Swedish => Self::Swedish,
            DetectableLanguage::Tagalog => Self::Tagalog,
            DetectableLanguage::Tamil => Self::Tamil,
            DetectableLanguage::Telugu => Self::Telugu,
            DetectableLanguage::Thai => Self::Thai,
            DetectableLanguage::Tsonga => Self::Tsonga,
            DetectableLanguage::Tswana => Self::Tswana,
            DetectableLanguage::Turkish => Self::Turkish,
            DetectableLanguage::Ukrainian => Self::Ukrainian,
            DetectableLanguage::Urdu => Self::Urdu,
            DetectableLanguage::Vietnamese => Self::Vietnamese,
            DetectableLanguage::Welsh => Self::Welsh,
            DetectableLanguage::Xhosa => Self::Xhosa,
            DetectableLanguage::Yoruba => Self::Yoruba,
            DetectableLanguage::Zulu => Self::Zulu,
        }
    }
}

impl From<DetectableLanguageDto> for DetectableLanguage {
    fn from(value: DetectableLanguageDto) -> Self {
        match value {
            DetectableLanguageDto::Afrikaans => Self::Afrikaans,
            DetectableLanguageDto::Albanian => Self::Albanian,
            DetectableLanguageDto::Arabic => Self::Arabic,
            DetectableLanguageDto::Armenian => Self::Armenian,
            DetectableLanguageDto::Azerbaijani => Self::Azerbaijani,
            DetectableLanguageDto::Basque => Self::Basque,
            DetectableLanguageDto::Belarusian => Self::Belarusian,
            DetectableLanguageDto::Bengali => Self::Bengali,
            DetectableLanguageDto::Bokmal => Self::Bokmal,
            DetectableLanguageDto::Bosnian => Self::Bosnian,
            DetectableLanguageDto::Bulgarian => Self::Bulgarian,
            DetectableLanguageDto::Catalan => Self::Catalan,
            DetectableLanguageDto::Chinese => Self::Chinese,
            DetectableLanguageDto::Croatian => Self::Croatian,
            DetectableLanguageDto::Czech => Self::Czech,
            DetectableLanguageDto::Danish => Self::Danish,
            DetectableLanguageDto::Dutch => Self::Dutch,
            DetectableLanguageDto::English => Self::English,
            DetectableLanguageDto::Esperanto => Self::Esperanto,
            DetectableLanguageDto::Estonian => Self::Estonian,
            DetectableLanguageDto::Finnish => Self::Finnish,
            DetectableLanguageDto::French => Self::French,
            DetectableLanguageDto::Ganda => Self::Ganda,
            DetectableLanguageDto::Georgian => Self::Georgian,
            DetectableLanguageDto::German => Self::German,
            DetectableLanguageDto::Greek => Self::Greek,
            DetectableLanguageDto::Gujarati => Self::Gujarati,
            DetectableLanguageDto::Hebrew => Self::Hebrew,
            DetectableLanguageDto::Hindi => Self::Hindi,
            DetectableLanguageDto::Hungarian => Self::Hungarian,
            DetectableLanguageDto::Icelandic => Self::Icelandic,
            DetectableLanguageDto::Indonesian => Self::Indonesian,
            DetectableLanguageDto::Irish => Self::Irish,
            DetectableLanguageDto::Italian => Self::Italian,
            DetectableLanguageDto::Japanese => Self::Japanese,
            DetectableLanguageDto::Kazakh => Self::Kazakh,
            DetectableLanguageDto::Korean => Self::Korean,
            DetectableLanguageDto::Latin => Self::Latin,
            DetectableLanguageDto::Latvian => Self::Latvian,
            DetectableLanguageDto::Lithuanian => Self::Lithuanian,
            DetectableLanguageDto::Macedonian => Self::Macedonian,
            DetectableLanguageDto::Malay => Self::Malay,
            DetectableLanguageDto::Maori => Self::Maori,
            DetectableLanguageDto::Marathi => Self::Marathi,
            DetectableLanguageDto::Mongolian => Self::Mongolian,
            DetectableLanguageDto::Nynorsk => Self::Nynorsk,
            DetectableLanguageDto::Persian => Self::Persian,
            DetectableLanguageDto::Polish => Self::Polish,
            DetectableLanguageDto::Portuguese => Self::Portuguese,
            DetectableLanguageDto::Punjabi => Self::Punjabi,
            DetectableLanguageDto::Romanian => Self::Romanian,
            DetectableLanguageDto::Russian => Self::Russian,
            DetectableLanguageDto::Serbian => Self::Serbian,
            DetectableLanguageDto::Shona => Self::Shona,
            DetectableLanguageDto::Slovak => Self::Slovak,
            DetectableLanguageDto::Slovene => Self::Slovene,
            DetectableLanguageDto::Somali => Self::Somali,
            DetectableLanguageDto::Sotho => Self::Sotho,
            DetectableLanguageDto::Spanish => Self::Spanish,
            DetectableLanguageDto::Swahili => Self::Swahili,
            DetectableLanguageDto::Swedish => Self::Swedish,
            DetectableLanguageDto::Tagalog => Self::Tagalog,
            DetectableLanguageDto::Tamil => Self::Tamil,
            DetectableLanguageDto::Telugu => Self::Telugu,
            DetectableLanguageDto::Thai => Self::Thai,
            DetectableLanguageDto::Tsonga => Self::Tsonga,
            DetectableLanguageDto::Tswana => Self::Tswana,
            DetectableLanguageDto::Turkish => Self::Turkish,
            DetectableLanguageDto::Ukrainian => Self::Ukrainian,
            DetectableLanguageDto::Urdu => Self::Urdu,
            DetectableLanguageDto::Vietnamese => Self::Vietnamese,
            DetectableLanguageDto::Welsh => Self::Welsh,
            DetectableLanguageDto::Xhosa => Self::Xhosa,
            DetectableLanguageDto::Yoruba => Self::Yoruba,
            DetectableLanguageDto::Zulu => Self::Zulu,
        }
    }
}

/// Language-detection scope setting used by the Lingua detector.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum LanguageDetectionScopeSettingDto {
    All,
    Common,
    Custom,
}

impl From<LanguageDetectionScopeSetting> for LanguageDetectionScopeSettingDto {
    fn from(value: LanguageDetectionScopeSetting) -> Self {
        match value {
            LanguageDetectionScopeSetting::All => Self::All,
            LanguageDetectionScopeSetting::Common => Self::Common,
            LanguageDetectionScopeSetting::Custom => Self::Custom,
        }
    }
}

impl From<LanguageDetectionScopeSettingDto> for LanguageDetectionScopeSetting {
    fn from(value: LanguageDetectionScopeSettingDto) -> Self {
        match value {
            LanguageDetectionScopeSettingDto::All => Self::All,
            LanguageDetectionScopeSettingDto::Common => Self::Common,
            LanguageDetectionScopeSettingDto::Custom => Self::Custom,
        }
    }
}

/// Automatic source-language detection settings.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct LanguageDetectionSettingsDto {
    pub scope: LanguageDetectionScopeSettingDto,
    pub custom_detection_scope: Vec<DetectableLanguageDto>,
    pub fallback_to: DetectableLanguageDto,
}

impl From<LanguageDetectionSettings> for LanguageDetectionSettingsDto {
    fn from(value: LanguageDetectionSettings) -> Self {
        Self {
            scope: value.scope.into(),
            custom_detection_scope: value
                .custom_detection_scope
                .into_iter()
                .map(Into::into)
                .collect(),
            fallback_to: DetectableLanguage::from_str(value.fallback_to.0.as_str())
                .unwrap_or(DetectableLanguage::English)
                .into(),
        }
    }
}

impl From<LanguageDetectionSettingsDto> for LanguageDetectionSettings {
    fn from(value: LanguageDetectionSettingsDto) -> Self {
        Self {
            scope: value.scope.into(),
            custom_detection_scope: value
                .custom_detection_scope
                .into_iter()
                .map(Into::into)
                .collect(),
            fallback_to: LanguageCode(
                DetectableLanguage::from(value.fallback_to)
                    .as_str()
                    .to_owned(),
            ),
        }
    }
}
