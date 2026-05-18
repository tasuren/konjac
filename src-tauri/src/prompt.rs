pub struct RenderTranslationPromptOptions<'a> {
    pub template: &'a str,
    pub source_language_name: &'a str,
    pub source_language_code: &'a str,
    pub target_language_name: &'a str,
    pub target_language_code: &'a str,
    pub text: &'a str,
}

pub fn render_translation_prompt(opts: RenderTranslationPromptOptions) -> String {
    opts.template
        .replace("{source_lang}", opts.source_language_name)
        .replace("{source_code}", opts.source_language_code)
        .replace("{target_lang}", opts.target_language_name)
        .replace("{target_code}", opts.target_language_code)
        .replace("{text}", opts.text)
}
