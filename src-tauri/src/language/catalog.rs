use crate::language::DetectableLanguage;

/// Canonical language definition bundled with the application.
/// This type represents built-in selectable languages and is not intended for user-provided or persisted data.
#[derive(Debug, Clone)]
pub struct AppLanguage {
    /// A language code (ISO 639-1).
    pub code: &'static str,
    pub name: &'static str,
    pub detectable: Option<DetectableLanguage>,
}

pub fn find_language_by_code(code: &str) -> Option<&'static AppLanguage> {
    SELECTABLE_LANGUAGES
        .iter()
        .find(|language| language.code == code)
}

pub fn language_name_or_code(code: &str) -> &str {
    find_language_by_code(code)
        .map(|language| language.name)
        .unwrap_or(code)
}

/// A list of common languages supported by the application.
pub const COMMON_LANGUAGES: &[AppLanguage] = &[
    AppLanguage {
        code: "zh",
        name: "Chinese",
        detectable: Some(DetectableLanguage::Chinese),
    },
    AppLanguage {
        code: "en",
        name: "English",
        detectable: Some(DetectableLanguage::English),
    },
    AppLanguage {
        code: "fr",
        name: "French",
        detectable: Some(DetectableLanguage::French),
    },
    AppLanguage {
        code: "de",
        name: "German",
        detectable: Some(DetectableLanguage::German),
    },
    AppLanguage {
        code: "it",
        name: "Italian",
        detectable: Some(DetectableLanguage::Italian),
    },
    AppLanguage {
        code: "ja",
        name: "Japanese",
        detectable: Some(DetectableLanguage::Japanese),
    },
    AppLanguage {
        code: "ko",
        name: "Korean",
        detectable: Some(DetectableLanguage::Korean),
    },
    AppLanguage {
        code: "pt",
        name: "Portuguese",
        detectable: Some(DetectableLanguage::Portuguese),
    },
    AppLanguage {
        code: "ru",
        name: "Russian",
        detectable: Some(DetectableLanguage::Russian),
    },
    AppLanguage {
        code: "es",
        name: "Spanish",
        detectable: Some(DetectableLanguage::Spanish),
    },
];

/// List of selectable languages bundled with the application.
pub const SELECTABLE_LANGUAGES: &[AppLanguage] = &[
    AppLanguage {
        code: "af",
        name: "Afrikaans",
        detectable: Some(DetectableLanguage::Afrikaans),
    },
    AppLanguage {
        code: "sq",
        name: "Albanian",
        detectable: Some(DetectableLanguage::Albanian),
    },
    AppLanguage {
        code: "ar",
        name: "Arabic",
        detectable: Some(DetectableLanguage::Arabic),
    },
    AppLanguage {
        code: "hy",
        name: "Armenian",
        detectable: Some(DetectableLanguage::Armenian),
    },
    AppLanguage {
        code: "az",
        name: "Azerbaijani",
        detectable: Some(DetectableLanguage::Azerbaijani),
    },
    AppLanguage {
        code: "eu",
        name: "Basque",
        detectable: Some(DetectableLanguage::Basque),
    },
    AppLanguage {
        code: "be",
        name: "Belarusian",
        detectable: Some(DetectableLanguage::Belarusian),
    },
    AppLanguage {
        code: "bn",
        name: "Bengali",
        detectable: Some(DetectableLanguage::Bengali),
    },
    AppLanguage {
        code: "nb",
        name: "Bokmal",
        detectable: Some(DetectableLanguage::Bokmal),
    },
    AppLanguage {
        code: "bs",
        name: "Bosnian",
        detectable: Some(DetectableLanguage::Bosnian),
    },
    AppLanguage {
        code: "bg",
        name: "Bulgarian",
        detectable: Some(DetectableLanguage::Bulgarian),
    },
    AppLanguage {
        code: "ca",
        name: "Catalan",
        detectable: Some(DetectableLanguage::Catalan),
    },
    AppLanguage {
        code: "zh",
        name: "Chinese",
        detectable: Some(DetectableLanguage::Chinese),
    },
    AppLanguage {
        code: "hr",
        name: "Croatian",
        detectable: Some(DetectableLanguage::Croatian),
    },
    AppLanguage {
        code: "cs",
        name: "Czech",
        detectable: Some(DetectableLanguage::Czech),
    },
    AppLanguage {
        code: "da",
        name: "Danish",
        detectable: Some(DetectableLanguage::Danish),
    },
    AppLanguage {
        code: "nl",
        name: "Dutch",
        detectable: Some(DetectableLanguage::Dutch),
    },
    AppLanguage {
        code: "en",
        name: "English",
        detectable: Some(DetectableLanguage::English),
    },
    AppLanguage {
        code: "eo",
        name: "Esperanto",
        detectable: Some(DetectableLanguage::Esperanto),
    },
    AppLanguage {
        code: "et",
        name: "Estonian",
        detectable: Some(DetectableLanguage::Estonian),
    },
    AppLanguage {
        code: "fi",
        name: "Finnish",
        detectable: Some(DetectableLanguage::Finnish),
    },
    AppLanguage {
        code: "fr",
        name: "French",
        detectable: Some(DetectableLanguage::French),
    },
    AppLanguage {
        code: "lg",
        name: "Ganda",
        detectable: Some(DetectableLanguage::Ganda),
    },
    AppLanguage {
        code: "ka",
        name: "Georgian",
        detectable: Some(DetectableLanguage::Georgian),
    },
    AppLanguage {
        code: "de",
        name: "German",
        detectable: Some(DetectableLanguage::German),
    },
    AppLanguage {
        code: "el",
        name: "Greek",
        detectable: Some(DetectableLanguage::Greek),
    },
    AppLanguage {
        code: "gu",
        name: "Gujarati",
        detectable: Some(DetectableLanguage::Gujarati),
    },
    AppLanguage {
        code: "he",
        name: "Hebrew",
        detectable: Some(DetectableLanguage::Hebrew),
    },
    AppLanguage {
        code: "hi",
        name: "Hindi",
        detectable: Some(DetectableLanguage::Hindi),
    },
    AppLanguage {
        code: "hu",
        name: "Hungarian",
        detectable: Some(DetectableLanguage::Hungarian),
    },
    AppLanguage {
        code: "is",
        name: "Icelandic",
        detectable: Some(DetectableLanguage::Icelandic),
    },
    AppLanguage {
        code: "id",
        name: "Indonesian",
        detectable: Some(DetectableLanguage::Indonesian),
    },
    AppLanguage {
        code: "ga",
        name: "Irish",
        detectable: Some(DetectableLanguage::Irish),
    },
    AppLanguage {
        code: "it",
        name: "Italian",
        detectable: Some(DetectableLanguage::Italian),
    },
    AppLanguage {
        code: "ja",
        name: "Japanese",
        detectable: Some(DetectableLanguage::Japanese),
    },
    AppLanguage {
        code: "kk",
        name: "Kazakh",
        detectable: Some(DetectableLanguage::Kazakh),
    },
    AppLanguage {
        code: "ko",
        name: "Korean",
        detectable: Some(DetectableLanguage::Korean),
    },
    AppLanguage {
        code: "la",
        name: "Latin",
        detectable: Some(DetectableLanguage::Latin),
    },
    AppLanguage {
        code: "lv",
        name: "Latvian",
        detectable: Some(DetectableLanguage::Latvian),
    },
    AppLanguage {
        code: "lt",
        name: "Lithuanian",
        detectable: Some(DetectableLanguage::Lithuanian),
    },
    AppLanguage {
        code: "mk",
        name: "Macedonian",
        detectable: Some(DetectableLanguage::Macedonian),
    },
    AppLanguage {
        code: "ms",
        name: "Malay",
        detectable: Some(DetectableLanguage::Malay),
    },
    AppLanguage {
        code: "mi",
        name: "Maori",
        detectable: Some(DetectableLanguage::Maori),
    },
    AppLanguage {
        code: "mr",
        name: "Marathi",
        detectable: Some(DetectableLanguage::Marathi),
    },
    AppLanguage {
        code: "mn",
        name: "Mongolian",
        detectable: Some(DetectableLanguage::Mongolian),
    },
    AppLanguage {
        code: "nn",
        name: "Nynorsk",
        detectable: Some(DetectableLanguage::Nynorsk),
    },
    AppLanguage {
        code: "fa",
        name: "Persian",
        detectable: Some(DetectableLanguage::Persian),
    },
    AppLanguage {
        code: "pl",
        name: "Polish",
        detectable: Some(DetectableLanguage::Polish),
    },
    AppLanguage {
        code: "pt",
        name: "Portuguese",
        detectable: Some(DetectableLanguage::Portuguese),
    },
    AppLanguage {
        code: "pa",
        name: "Punjabi",
        detectable: Some(DetectableLanguage::Punjabi),
    },
    AppLanguage {
        code: "ro",
        name: "Romanian",
        detectable: Some(DetectableLanguage::Romanian),
    },
    AppLanguage {
        code: "ru",
        name: "Russian",
        detectable: Some(DetectableLanguage::Russian),
    },
    AppLanguage {
        code: "sr",
        name: "Serbian",
        detectable: Some(DetectableLanguage::Serbian),
    },
    AppLanguage {
        code: "sn",
        name: "Shona",
        detectable: Some(DetectableLanguage::Shona),
    },
    AppLanguage {
        code: "sk",
        name: "Slovak",
        detectable: Some(DetectableLanguage::Slovak),
    },
    AppLanguage {
        code: "sl",
        name: "Slovene",
        detectable: Some(DetectableLanguage::Slovene),
    },
    AppLanguage {
        code: "so",
        name: "Somali",
        detectable: Some(DetectableLanguage::Somali),
    },
    AppLanguage {
        code: "st",
        name: "Sotho",
        detectable: Some(DetectableLanguage::Sotho),
    },
    AppLanguage {
        code: "es",
        name: "Spanish",
        detectable: Some(DetectableLanguage::Spanish),
    },
    AppLanguage {
        code: "sw",
        name: "Swahili",
        detectable: Some(DetectableLanguage::Swahili),
    },
    AppLanguage {
        code: "sv",
        name: "Swedish",
        detectable: Some(DetectableLanguage::Swedish),
    },
    AppLanguage {
        code: "tl",
        name: "Tagalog",
        detectable: Some(DetectableLanguage::Tagalog),
    },
    AppLanguage {
        code: "ta",
        name: "Tamil",
        detectable: Some(DetectableLanguage::Tamil),
    },
    AppLanguage {
        code: "te",
        name: "Telugu",
        detectable: Some(DetectableLanguage::Telugu),
    },
    AppLanguage {
        code: "th",
        name: "Thai",
        detectable: Some(DetectableLanguage::Thai),
    },
    AppLanguage {
        code: "ts",
        name: "Tsonga",
        detectable: Some(DetectableLanguage::Tsonga),
    },
    AppLanguage {
        code: "tn",
        name: "Tswana",
        detectable: Some(DetectableLanguage::Tswana),
    },
    AppLanguage {
        code: "tr",
        name: "Turkish",
        detectable: Some(DetectableLanguage::Turkish),
    },
    AppLanguage {
        code: "uk",
        name: "Ukrainian",
        detectable: Some(DetectableLanguage::Ukrainian),
    },
    AppLanguage {
        code: "ur",
        name: "Urdu",
        detectable: Some(DetectableLanguage::Urdu),
    },
    AppLanguage {
        code: "vi",
        name: "Vietnamese",
        detectable: Some(DetectableLanguage::Vietnamese),
    },
    AppLanguage {
        code: "cy",
        name: "Welsh",
        detectable: Some(DetectableLanguage::Welsh),
    },
    AppLanguage {
        code: "xh",
        name: "Xhosa",
        detectable: Some(DetectableLanguage::Xhosa),
    },
    AppLanguage {
        code: "yo",
        name: "Yoruba",
        detectable: Some(DetectableLanguage::Yoruba),
    },
    AppLanguage {
        code: "zu",
        name: "Zulu",
        detectable: Some(DetectableLanguage::Zulu),
    },
];
