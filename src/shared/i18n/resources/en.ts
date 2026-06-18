export const en = {
  app: {
    title: "Konjac",
  },
  common: {
    add: "Add",
    cancel: "Cancel",
    close: "Close",
    continue: "Continue",
    remove: "Remove",
  },
  linkModal: {
    closeAriaLabel: "Close modal",
    title: "External Link",
    message: "You're about to visit:",
  },
  windowCaptionControls: {
    minimize: "Minimize window",
    maximize: "Maximize window",
    restore: "Restore window",
    close: "Close window",
  },
  settings: {
    title: "Settings",
    closeAriaLabel: "Close settings",
    general: "General",
    language: "Language",
    displayLanguage: "Display language",
    theme: "Theme",
    themeOptions: {
      dark: "Dark",
      light: "Light",
      system: "Follow system",
    },
    localeOptions: {
      system: "Follow system",
      ja: "日本語",
      en: "English",
      zhCN: "简体中文",
    },
    model: "Model used for translation",
    systemPrompt: "System prompt",
    translationPrompt: "Translation prompt",
    ollamaBaseUrlPrefix: "Ollama request",
    ollamaKeepAlivePrefix: "Ollama request",
    ollamaKeepAliveSuffix: "value (optional)",
    ollamaKeepAliveDescriptionPrefix:
      "Specify how long Ollama keeps a loaded model in memory. See ",
    ollamaKeepAliveDescriptionLink: "here",
    ollamaKeepAliveDescriptionSuffix: " for details. Example:",
    defaultSourceLanguage: "Default source language",
    defaultSourceLanguageDescription:
      "Set the source language selected when the app starts.",
    defaultTargetLanguage: "Default target language",
    defaultTargetLanguageDescription:
      "Set the target language selected when the app starts.",
    fallbackTargetLanguage: "Fallback target language",
    fallbackTargetLanguageDescription:
      "Use a different target language when auto-detection resolves to the current target language.",
    languageListScope: "Languages shown in language selection",
    detectionLanguageScope: "Languages used for auto-detection",
    detectionLanguageScopeDescription:
      "Restrict language detection to selected languages. This can help when detection is slow.",
    detectionFallback: "Auto-detection fallback",
    detectionFallbackDescription:
      "Choose the source language used when auto-detection fails.",
    customLanguageList: "Languages to show",
  },
  language: {
    autoDetect: "Auto-detect",
    scopes: {
      all: "All languages",
      common: "Common languages",
      custom: "Selected languages only",
    },
  },
  llm: {
    noModels: "No models were found",
    noModelSelected: "Please select a model",
    refreshModels: "Reload models",
    loadingModels: "Loading models",
    providerConnectionFailed:
      "Could not connect to {{provider}}. Check the base_url setting below.",
    selectedModelUnavailable:
      "The selected model is not in the current model list. Reload the model list.",
    resetPromptConfirm: "Reset the translation prompt to its initial value?",
    promptVariablesIntro:
      "The following variables can be inserted into the prompt.",
    variables: {
      sourceLang: "Selected or detected source language name",
      sourceCode: "Selected or detected source language code",
      targetLang: "Selected target language name",
      targetCode: "Selected target language code",
      text: "Text to translate",
    },
    resetPrompt: "Reset to initial value",
  },
  translation: {
    inputPlaceholder: "Enter text to translate",
    inputPlaceholderWithQuickCopy:
      "Enter text to translate, or select text and press {{shortcut}} twice to translate",
    inputClear: "Clear input",
    noModel:
      "No AI model is configured for translation. Configure a model to start translating.",
    failed: "Translation failed.",
    unavailable: "Translation cannot start.",
    providerUnavailable:
      "Translation cannot start because {{provider}} is unavailable. Check the base_url setting.",
    placeholder: "Translation results will appear here.",
    requesting: "Requesting",
    copy: "Copy to clipboard",
    maximize: "Maximize translation result",
    minimize: "Minimize translation result",
    swapLanguages: "Swap languages",
    clipboardInputMode: "Clipboard input mode",
    clipboardInputText: "Text",
    clipboardInputMarkdown: "Markdown",
    useClipboardTextInput: "Use clipboard text as-is",
    useClipboardMarkdownInput: "Convert HTML to Markdown",
    outputRenderMode: "Output render mode",
    outputPlain: "Plain",
    outputMarkdown: "Markdown",
    showPlainOutput: "Show as plain text",
    showMarkdownOutput: "Show as Markdown",
  },
} as const;
