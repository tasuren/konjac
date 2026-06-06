mod catalog;
mod detectable;
mod resolver;

pub use catalog::*;
pub use detectable::*;
pub use resolver::*;
use serde::{Deserialize, Serialize};

/// Represents a language code (ISO 639-1).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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
