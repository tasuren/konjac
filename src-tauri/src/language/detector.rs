use lingua::{Language, LanguageDetector, LanguageDetectorBuilder};

use super::LanguageCode;
use crate::language::{COMMON_LANGUAGES, DetectableLanguage, SourceLanguage, TargetLanguage};

#[derive(Debug, Clone, Copy)]
pub enum LanguageDetectionScope {
    Common,
    All,
    Custom,
}

#[derive(Debug, Clone)]
pub enum ResolvedSourceLanguage {
    Detected(LanguageCode),
    Assumed(LanguageCode),
    Manual(LanguageCode),
}

impl ResolvedSourceLanguage {
    pub fn get_language_info(&self) -> &LanguageCode {
        match self {
            Self::Detected(lang) => lang,
            Self::Assumed(lang) => lang,
            Self::Manual(lang) => lang,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ResolvedTargetLanguage(pub LanguageCode);

pub struct ResolvedLanguagePair {
    pub source: ResolvedSourceLanguage,
    pub target: ResolvedTargetLanguage,
}

pub struct LanguageResolver {
    detector: LanguageDetector,
    fallback_to: Language,
}

fn common_detection_languages() -> Vec<lingua::Language> {
    COMMON_LANGUAGES
        .iter()
        .filter_map(|language| language.detectable.map(Into::into))
        .collect()
}

impl LanguageResolver {
    pub fn new(
        scope: LanguageDetectionScope,
        custom_detection_scope: Vec<DetectableLanguage>,
        fallback_to: DetectableLanguage,
    ) -> Self {
        let detector: LanguageDetector = match scope {
            LanguageDetectionScope::All => LanguageDetectorBuilder::from_all_languages(),
            LanguageDetectionScope::Common => {
                LanguageDetectorBuilder::from_languages(&common_detection_languages())
            }
            LanguageDetectionScope::Custom => {
                let languages = custom_detection_scope
                    .into_iter()
                    .map(Into::into)
                    .collect::<Vec<_>>();

                if languages.is_empty() {
                    LanguageDetectorBuilder::from_languages(&common_detection_languages())
                } else {
                    LanguageDetectorBuilder::from_languages(&languages)
                }
            }
        }
        .build();

        Self {
            detector,
            fallback_to: fallback_to.into(),
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
                Some(lang) => ResolvedSourceLanguage::Detected(lingua_to_code(&lang)),
                None => ResolvedSourceLanguage::Assumed(lingua_to_code(&self.fallback_to)),
            },
            SourceLanguage::Manual(lang) => ResolvedSourceLanguage::Manual(lang),
        };
        let target = ResolvedTargetLanguage(target.0);

        ResolvedLanguagePair { source, target }
    }
}

fn lingua_to_code(lang: &lingua::Language) -> LanguageCode {
    LanguageCode(lang.iso_code_639_1().to_string())
}
