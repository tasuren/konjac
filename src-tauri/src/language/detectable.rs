use std::str::FromStr;

use lingua::Language as LinguaLanguage;
use serde::{Deserialize, Serialize};

/// Language that can be used as a Lingua detection candidate.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DetectableLanguage {
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

impl From<LinguaLanguage> for DetectableLanguage {
    fn from(value: LinguaLanguage) -> Self {
        match value {
            LinguaLanguage::Afrikaans => Self::Afrikaans,
            LinguaLanguage::Albanian => Self::Albanian,
            LinguaLanguage::Arabic => Self::Arabic,
            LinguaLanguage::Armenian => Self::Armenian,
            LinguaLanguage::Azerbaijani => Self::Azerbaijani,
            LinguaLanguage::Basque => Self::Basque,
            LinguaLanguage::Belarusian => Self::Belarusian,
            LinguaLanguage::Bengali => Self::Bengali,
            LinguaLanguage::Bokmal => Self::Bokmal,
            LinguaLanguage::Bosnian => Self::Bosnian,
            LinguaLanguage::Bulgarian => Self::Bulgarian,
            LinguaLanguage::Catalan => Self::Catalan,
            LinguaLanguage::Chinese => Self::Chinese,
            LinguaLanguage::Croatian => Self::Croatian,
            LinguaLanguage::Czech => Self::Czech,
            LinguaLanguage::Danish => Self::Danish,
            LinguaLanguage::Dutch => Self::Dutch,
            LinguaLanguage::English => Self::English,
            LinguaLanguage::Esperanto => Self::Esperanto,
            LinguaLanguage::Estonian => Self::Estonian,
            LinguaLanguage::Finnish => Self::Finnish,
            LinguaLanguage::French => Self::French,
            LinguaLanguage::Ganda => Self::Ganda,
            LinguaLanguage::Georgian => Self::Georgian,
            LinguaLanguage::German => Self::German,
            LinguaLanguage::Greek => Self::Greek,
            LinguaLanguage::Gujarati => Self::Gujarati,
            LinguaLanguage::Hebrew => Self::Hebrew,
            LinguaLanguage::Hindi => Self::Hindi,
            LinguaLanguage::Hungarian => Self::Hungarian,
            LinguaLanguage::Icelandic => Self::Icelandic,
            LinguaLanguage::Indonesian => Self::Indonesian,
            LinguaLanguage::Irish => Self::Irish,
            LinguaLanguage::Italian => Self::Italian,
            LinguaLanguage::Japanese => Self::Japanese,
            LinguaLanguage::Kazakh => Self::Kazakh,
            LinguaLanguage::Korean => Self::Korean,
            LinguaLanguage::Latin => Self::Latin,
            LinguaLanguage::Latvian => Self::Latvian,
            LinguaLanguage::Lithuanian => Self::Lithuanian,
            LinguaLanguage::Macedonian => Self::Macedonian,
            LinguaLanguage::Malay => Self::Malay,
            LinguaLanguage::Maori => Self::Maori,
            LinguaLanguage::Marathi => Self::Marathi,
            LinguaLanguage::Mongolian => Self::Mongolian,
            LinguaLanguage::Nynorsk => Self::Nynorsk,
            LinguaLanguage::Persian => Self::Persian,
            LinguaLanguage::Polish => Self::Polish,
            LinguaLanguage::Portuguese => Self::Portuguese,
            LinguaLanguage::Punjabi => Self::Punjabi,
            LinguaLanguage::Romanian => Self::Romanian,
            LinguaLanguage::Russian => Self::Russian,
            LinguaLanguage::Serbian => Self::Serbian,
            LinguaLanguage::Shona => Self::Shona,
            LinguaLanguage::Slovak => Self::Slovak,
            LinguaLanguage::Slovene => Self::Slovene,
            LinguaLanguage::Somali => Self::Somali,
            LinguaLanguage::Sotho => Self::Sotho,
            LinguaLanguage::Spanish => Self::Spanish,
            LinguaLanguage::Swahili => Self::Swahili,
            LinguaLanguage::Swedish => Self::Swedish,
            LinguaLanguage::Tagalog => Self::Tagalog,
            LinguaLanguage::Tamil => Self::Tamil,
            LinguaLanguage::Telugu => Self::Telugu,
            LinguaLanguage::Thai => Self::Thai,
            LinguaLanguage::Tsonga => Self::Tsonga,
            LinguaLanguage::Tswana => Self::Tswana,
            LinguaLanguage::Turkish => Self::Turkish,
            LinguaLanguage::Ukrainian => Self::Ukrainian,
            LinguaLanguage::Urdu => Self::Urdu,
            LinguaLanguage::Vietnamese => Self::Vietnamese,
            LinguaLanguage::Welsh => Self::Welsh,
            LinguaLanguage::Xhosa => Self::Xhosa,
            LinguaLanguage::Yoruba => Self::Yoruba,
            LinguaLanguage::Zulu => Self::Zulu,
        }
    }
}

impl From<DetectableLanguage> for LinguaLanguage {
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

impl DetectableLanguage {
    /// Returns the ISO 639-1 language code used for this detectable language.
    pub const fn as_str(&self) -> &'static str {
        match self {
            Self::Afrikaans => "af",
            Self::Albanian => "sq",
            Self::Arabic => "ar",
            Self::Armenian => "hy",
            Self::Azerbaijani => "az",
            Self::Basque => "eu",
            Self::Belarusian => "be",
            Self::Bengali => "bn",
            Self::Bokmal => "nb",
            Self::Bosnian => "bs",
            Self::Bulgarian => "bg",
            Self::Catalan => "ca",
            Self::Chinese => "zh",
            Self::Croatian => "hr",
            Self::Czech => "cs",
            Self::Danish => "da",
            Self::Dutch => "nl",
            Self::English => "en",
            Self::Esperanto => "eo",
            Self::Estonian => "et",
            Self::Finnish => "fi",
            Self::French => "fr",
            Self::Ganda => "lg",
            Self::Georgian => "ka",
            Self::German => "de",
            Self::Greek => "el",
            Self::Gujarati => "gu",
            Self::Hebrew => "he",
            Self::Hindi => "hi",
            Self::Hungarian => "hu",
            Self::Icelandic => "is",
            Self::Indonesian => "id",
            Self::Irish => "ga",
            Self::Italian => "it",
            Self::Japanese => "ja",
            Self::Kazakh => "kk",
            Self::Korean => "ko",
            Self::Latin => "la",
            Self::Latvian => "lv",
            Self::Lithuanian => "lt",
            Self::Macedonian => "mk",
            Self::Malay => "ms",
            Self::Maori => "mi",
            Self::Marathi => "mr",
            Self::Mongolian => "mn",
            Self::Nynorsk => "nn",
            Self::Persian => "fa",
            Self::Polish => "pl",
            Self::Portuguese => "pt",
            Self::Punjabi => "pa",
            Self::Romanian => "ro",
            Self::Russian => "ru",
            Self::Serbian => "sr",
            Self::Shona => "sn",
            Self::Slovak => "sk",
            Self::Slovene => "sl",
            Self::Somali => "so",
            Self::Sotho => "st",
            Self::Spanish => "es",
            Self::Swahili => "sw",
            Self::Swedish => "sv",
            Self::Tagalog => "tl",
            Self::Tamil => "ta",
            Self::Telugu => "te",
            Self::Thai => "th",
            Self::Tsonga => "ts",
            Self::Tswana => "tn",
            Self::Turkish => "tr",
            Self::Ukrainian => "uk",
            Self::Urdu => "ur",
            Self::Vietnamese => "vi",
            Self::Welsh => "cy",
            Self::Xhosa => "xh",
            Self::Yoruba => "yo",
            Self::Zulu => "zu",
        }
    }
}

impl FromStr for DetectableLanguage {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "af" => Ok(Self::Afrikaans),
            "sq" => Ok(Self::Albanian),
            "ar" => Ok(Self::Arabic),
            "hy" => Ok(Self::Armenian),
            "az" => Ok(Self::Azerbaijani),
            "eu" => Ok(Self::Basque),
            "be" => Ok(Self::Belarusian),
            "bn" => Ok(Self::Bengali),
            "nb" => Ok(Self::Bokmal),
            "bs" => Ok(Self::Bosnian),
            "bg" => Ok(Self::Bulgarian),
            "ca" => Ok(Self::Catalan),
            "zh" => Ok(Self::Chinese),
            "hr" => Ok(Self::Croatian),
            "cs" => Ok(Self::Czech),
            "da" => Ok(Self::Danish),
            "nl" => Ok(Self::Dutch),
            "en" => Ok(Self::English),
            "eo" => Ok(Self::Esperanto),
            "et" => Ok(Self::Estonian),
            "fi" => Ok(Self::Finnish),
            "fr" => Ok(Self::French),
            "lg" => Ok(Self::Ganda),
            "ka" => Ok(Self::Georgian),
            "de" => Ok(Self::German),
            "el" => Ok(Self::Greek),
            "gu" => Ok(Self::Gujarati),
            "he" => Ok(Self::Hebrew),
            "hi" => Ok(Self::Hindi),
            "hu" => Ok(Self::Hungarian),
            "is" => Ok(Self::Icelandic),
            "id" => Ok(Self::Indonesian),
            "ga" => Ok(Self::Irish),
            "it" => Ok(Self::Italian),
            "ja" => Ok(Self::Japanese),
            "kk" => Ok(Self::Kazakh),
            "ko" => Ok(Self::Korean),
            "la" => Ok(Self::Latin),
            "lv" => Ok(Self::Latvian),
            "lt" => Ok(Self::Lithuanian),
            "mk" => Ok(Self::Macedonian),
            "ms" => Ok(Self::Malay),
            "mi" => Ok(Self::Maori),
            "mr" => Ok(Self::Marathi),
            "mn" => Ok(Self::Mongolian),
            "nn" => Ok(Self::Nynorsk),
            "fa" => Ok(Self::Persian),
            "pl" => Ok(Self::Polish),
            "pt" => Ok(Self::Portuguese),
            "pa" => Ok(Self::Punjabi),
            "ro" => Ok(Self::Romanian),
            "ru" => Ok(Self::Russian),
            "sr" => Ok(Self::Serbian),
            "sn" => Ok(Self::Shona),
            "sk" => Ok(Self::Slovak),
            "sl" => Ok(Self::Slovene),
            "so" => Ok(Self::Somali),
            "st" => Ok(Self::Sotho),
            "es" => Ok(Self::Spanish),
            "sw" => Ok(Self::Swahili),
            "sv" => Ok(Self::Swedish),
            "tl" => Ok(Self::Tagalog),
            "ta" => Ok(Self::Tamil),
            "te" => Ok(Self::Telugu),
            "th" => Ok(Self::Thai),
            "ts" => Ok(Self::Tsonga),
            "tn" => Ok(Self::Tswana),
            "tr" => Ok(Self::Turkish),
            "uk" => Ok(Self::Ukrainian),
            "ur" => Ok(Self::Urdu),
            "vi" => Ok(Self::Vietnamese),
            "cy" => Ok(Self::Welsh),
            "xh" => Ok(Self::Xhosa),
            "yo" => Ok(Self::Yoruba),
            "zu" => Ok(Self::Zulu),
            _ => Err(()),
        }
    }
}
