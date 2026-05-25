//! Language-related DTOs for IPC.

use lingua::Language;
use serde::{Deserialize, Serialize};

use crate::{
    language::{LanguageInfo, ResolvedSourceLanguage, SourceLanguage, TargetLanguage},
    settings::{
        AutoDetectionSettings, LanguageDetectionScopeSetting, LanguageInfoSetting,
        LanguageListScopeSetting, SourceLanguageSetting, TargetLanguageSetting,
    },
};

/// Language metadata shared with the frontend for display and translation choices.
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

impl From<LanguageInfoSetting> for LanguageInfoDto {
    fn from(value: LanguageInfoSetting) -> Self {
        Self {
            name: value.name,
            code: value.code,
        }
    }
}

impl From<LanguageInfoDto> for LanguageInfoSetting {
    fn from(value: LanguageInfoDto) -> Self {
        Self {
            name: value.name,
            code: value.code,
        }
    }
}

impl From<Language> for LanguageInfoDto {
    fn from(value: Language) -> Self {
        Self {
            name: value.to_string(),
            code: value.iso_code_639_1().to_string(),
        }
    }
}

/// Source language selection sent with a translation request.
#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[serde(tag = "type", rename_all = "snake_case")]
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

/// Target language selection sent with a translation request.
#[derive(Debug, Clone, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct TargetLanguageDto(pub LanguageInfoDto);

impl From<TargetLanguageDto> for TargetLanguage {
    fn from(value: TargetLanguageDto) -> Self {
        Self(value.0.into())
    }
}

/// Source language resolved during translation.
#[derive(Debug, Clone, Serialize, ts_rs::TS)]
#[serde(tag = "type", rename_all = "snake_case")]
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

/// Persisted default source language setting.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[serde(tag = "type", rename_all = "snake_case")]
#[ts(export)]
pub enum SourceLanguageSettingDto {
    AutoDetect,
    Manual(LanguageInfoDto),
}

impl From<SourceLanguageSetting> for SourceLanguageSettingDto {
    fn from(value: SourceLanguageSetting) -> Self {
        match value {
            SourceLanguageSetting::AutoDetect => Self::AutoDetect,
            SourceLanguageSetting::Manual(lang) => Self::Manual(lang.into()),
        }
    }
}

impl From<SourceLanguageSettingDto> for SourceLanguageSetting {
    fn from(value: SourceLanguageSettingDto) -> Self {
        match value {
            SourceLanguageSettingDto::AutoDetect => Self::AutoDetect,
            SourceLanguageSettingDto::Manual(lang) => Self::Manual(lang.into()),
        }
    }
}

/// Persisted default target language setting.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct TargetLanguageSettingDto(pub LanguageInfoDto);

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
#[ts(export)]
pub enum LanguageListScopeSettingDto {
    All,
    Common,
    Custom(Vec<LanguageInfoDto>),
}

impl From<LanguageListScopeSetting> for LanguageListScopeSettingDto {
    fn from(value: LanguageListScopeSetting) -> Self {
        match value {
            LanguageListScopeSetting::All => Self::All,
            LanguageListScopeSetting::Common => Self::Common,
            LanguageListScopeSetting::Custom(languages) => {
                Self::Custom(languages.into_iter().map(Into::into).collect())
            }
        }
    }
}

impl From<LanguageListScopeSettingDto> for LanguageListScopeSetting {
    fn from(value: LanguageListScopeSettingDto) -> Self {
        match value {
            LanguageListScopeSettingDto::All => Self::All,
            LanguageListScopeSettingDto::Common => Self::Common,
            LanguageListScopeSettingDto::Custom(languages) => {
                Self::Custom(languages.into_iter().map(Into::into).collect())
            }
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

impl From<Language> for DetectableLanguageDto {
    fn from(value: Language) -> Self {
        match value {
            Language::Afrikaans => Self::Afrikaans,
            Language::Albanian => Self::Albanian,
            Language::Arabic => Self::Arabic,
            Language::Armenian => Self::Armenian,
            Language::Azerbaijani => Self::Azerbaijani,
            Language::Basque => Self::Basque,
            Language::Belarusian => Self::Belarusian,
            Language::Bengali => Self::Bengali,
            Language::Bokmal => Self::Bokmal,
            Language::Bosnian => Self::Bosnian,
            Language::Bulgarian => Self::Bulgarian,
            Language::Catalan => Self::Catalan,
            Language::Chinese => Self::Chinese,
            Language::Croatian => Self::Croatian,
            Language::Czech => Self::Czech,
            Language::Danish => Self::Danish,
            Language::Dutch => Self::Dutch,
            Language::English => Self::English,
            Language::Esperanto => Self::Esperanto,
            Language::Estonian => Self::Estonian,
            Language::Finnish => Self::Finnish,
            Language::French => Self::French,
            Language::Ganda => Self::Ganda,
            Language::Georgian => Self::Georgian,
            Language::German => Self::German,
            Language::Greek => Self::Greek,
            Language::Gujarati => Self::Gujarati,
            Language::Hebrew => Self::Hebrew,
            Language::Hindi => Self::Hindi,
            Language::Hungarian => Self::Hungarian,
            Language::Icelandic => Self::Icelandic,
            Language::Indonesian => Self::Indonesian,
            Language::Irish => Self::Irish,
            Language::Italian => Self::Italian,
            Language::Japanese => Self::Japanese,
            Language::Kazakh => Self::Kazakh,
            Language::Korean => Self::Korean,
            Language::Latin => Self::Latin,
            Language::Latvian => Self::Latvian,
            Language::Lithuanian => Self::Lithuanian,
            Language::Macedonian => Self::Macedonian,
            Language::Malay => Self::Malay,
            Language::Maori => Self::Maori,
            Language::Marathi => Self::Marathi,
            Language::Mongolian => Self::Mongolian,
            Language::Nynorsk => Self::Nynorsk,
            Language::Persian => Self::Persian,
            Language::Polish => Self::Polish,
            Language::Portuguese => Self::Portuguese,
            Language::Punjabi => Self::Punjabi,
            Language::Romanian => Self::Romanian,
            Language::Russian => Self::Russian,
            Language::Serbian => Self::Serbian,
            Language::Shona => Self::Shona,
            Language::Slovak => Self::Slovak,
            Language::Slovene => Self::Slovene,
            Language::Somali => Self::Somali,
            Language::Sotho => Self::Sotho,
            Language::Spanish => Self::Spanish,
            Language::Swahili => Self::Swahili,
            Language::Swedish => Self::Swedish,
            Language::Tagalog => Self::Tagalog,
            Language::Tamil => Self::Tamil,
            Language::Telugu => Self::Telugu,
            Language::Thai => Self::Thai,
            Language::Tsonga => Self::Tsonga,
            Language::Tswana => Self::Tswana,
            Language::Turkish => Self::Turkish,
            Language::Ukrainian => Self::Ukrainian,
            Language::Urdu => Self::Urdu,
            Language::Vietnamese => Self::Vietnamese,
            Language::Welsh => Self::Welsh,
            Language::Xhosa => Self::Xhosa,
            Language::Yoruba => Self::Yoruba,
            Language::Zulu => Self::Zulu,
        }
    }
}

impl From<DetectableLanguageDto> for Language {
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
#[ts(export)]
pub enum LanguageDetectionScopeSettingDto {
    All,
    Common,
    Custom(Vec<DetectableLanguageDto>),
}

impl From<LanguageDetectionScopeSetting> for LanguageDetectionScopeSettingDto {
    fn from(value: LanguageDetectionScopeSetting) -> Self {
        match value {
            LanguageDetectionScopeSetting::All => Self::All,
            LanguageDetectionScopeSetting::Common => Self::Common,
            LanguageDetectionScopeSetting::Custom(languages) => {
                Self::Custom(languages.into_iter().map(Into::into).collect())
            }
        }
    }
}

impl From<LanguageDetectionScopeSettingDto> for LanguageDetectionScopeSetting {
    fn from(value: LanguageDetectionScopeSettingDto) -> Self {
        match value {
            LanguageDetectionScopeSettingDto::All => Self::All,
            LanguageDetectionScopeSettingDto::Common => Self::Common,
            LanguageDetectionScopeSettingDto::Custom(languages) => {
                Self::Custom(languages.into_iter().map(Into::into).collect())
            }
        }
    }
}

/// Automatic source-language detection settings.
#[derive(Debug, Clone, Serialize, Deserialize, ts_rs::TS)]
#[ts(export)]
pub struct AutoDetectionSettingsDto {
    pub scope: LanguageDetectionScopeSettingDto,
    pub fallback_to: DetectableLanguageDto,
}

impl From<AutoDetectionSettings> for AutoDetectionSettingsDto {
    fn from(value: AutoDetectionSettings) -> Self {
        Self {
            scope: value.scope.into(),
            fallback_to: value.fallback_to.into(),
        }
    }
}

impl From<AutoDetectionSettingsDto> for AutoDetectionSettings {
    fn from(value: AutoDetectionSettingsDto) -> Self {
        Self {
            scope: value.scope.into(),
            fallback_to: value.fallback_to.into(),
        }
    }
}
