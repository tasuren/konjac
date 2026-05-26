use lingua::{Language, LanguageDetector, LanguageDetectorBuilder};

pub enum SourceLanguage {
    AutoDetect,
    Manual(LanguageInfo),
}

pub struct TargetLanguage(pub LanguageInfo);

#[derive(Debug, Clone)]
pub struct LanguageInfo {
    pub name: String,
    pub code: String,
}

impl LanguageInfo {
    fn from_lingua(lang: Language) -> Self {
        Self {
            name: lang.to_string(),
            code: lang.iso_code_639_1().to_string(),
        }
    }
}

pub enum LanguageDetectionScope {
    Common,
    All,
    Custom { languages: Vec<Language> },
}

pub const COMMON_LANGUAGES: [Language; 6] = [
    Language::English,
    Language::French,
    Language::German,
    Language::Chinese,
    Language::Korean,
    Language::Japanese,
];

pub enum ResolvedSourceLanguage {
    Detected(LanguageInfo),
    Assumed(LanguageInfo),
    Manual(LanguageInfo),
}

impl ResolvedSourceLanguage {
    pub fn get_language_info(&self) -> &LanguageInfo {
        match self {
            Self::Detected(lang) => lang,
            Self::Assumed(lang) => lang,
            Self::Manual(lang) => lang,
        }
    }
}

pub struct ResolvedTargetLanguage(LanguageInfo);

impl ResolvedTargetLanguage {
    pub fn get_language_info(&self) -> &LanguageInfo {
        &self.0
    }
}

pub struct ResolvedLanguagePair {
    pub source: ResolvedSourceLanguage,
    pub target: ResolvedTargetLanguage,
}

pub struct LanguageResolver {
    detector: LanguageDetector,
    fallback_to: Language,
}

impl LanguageResolver {
    pub fn new(scope: LanguageDetectionScope, fallback_to: Language) -> Self {
        let detector = match scope {
            LanguageDetectionScope::All => LanguageDetectorBuilder::from_all_languages(),
            LanguageDetectionScope::Common => {
                LanguageDetectorBuilder::from_languages(&COMMON_LANGUAGES)
            }
            LanguageDetectionScope::Custom { languages } => {
                LanguageDetectorBuilder::from_languages(&languages)
            }
        }
        .build();

        Self {
            detector,
            fallback_to,
        }
    }

    pub fn resolve(
        &self,
        source: SourceLanguage,
        target: TargetLanguage,
        text: &str,
    ) -> ResolvedLanguagePair {
        let source = match source {
            SourceLanguage::AutoDetect => match self.detector.detect_language_of(text) {
                Some(lang) => ResolvedSourceLanguage::Detected(LanguageInfo::from_lingua(lang)),
                None => {
                    ResolvedSourceLanguage::Assumed(LanguageInfo::from_lingua(self.fallback_to))
                }
            },
            SourceLanguage::Manual(lang) => ResolvedSourceLanguage::Manual(lang),
        };
        let target = ResolvedTargetLanguage(target.0);

        ResolvedLanguagePair { source, target }
    }
}
