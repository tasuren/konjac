/// Converts HTML clipboard content into Markdown text.
pub fn html_to_markdown(html: &str) -> Result<String, String> {
    let converter = htmd::HtmlToMarkdownBuilder::new()
        .skip_tags(vec![
            "script", "style", "iframe", "object", "embed", "canvas", "svg", "noscript",
        ])
        .build();

    converter.convert(html).map_err(|e| e.to_string())
}
