mod catalog;
mod detectable;
mod detector;

pub use catalog::*;
pub use detectable::*;
pub use detector::*;
use serde::{Deserialize, Serialize};

/// Represents a language code (ISO 639-1).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageCode(pub String);

impl Default for LanguageCode {
    fn default() -> Self {
        Self("en".to_owned())
    }
}

#[derive(Debug, Clone)]
pub enum SourceLanguage {
    AutoDetect,
    Manual(LanguageCode),
}

#[derive(Debug, Clone)]
pub struct TargetLanguage(pub LanguageCode);
