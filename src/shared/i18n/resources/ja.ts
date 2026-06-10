export const ja = {
  app: {
    title: "Konjac / コンニャク",
  },
  common: {
    add: "追加",
    cancel: "キャンセル",
    close: "閉じる",
    continue: "続ける",
    remove: "削除",
  },
  linkModal: {
    closeAriaLabel: "モーダルを閉じる",
    title: "外部リンク",
    message: "以下のURLを開こうとしています:",
  },
  settings: {
    title: "設定",
    closeAriaLabel: "設定を閉じる",
    general: "全般",
    language: "言語",
    displayLanguage: "表示言語",
    theme: "テーマ",
    themeOptions: {
      dark: "ダーク",
      light: "ライト",
      system: "システムに合わせる",
    },
    localeOptions: {
      system: "システムに合わせる",
      ja: "日本語",
      en: "English",
      zhCN: "简体中文",
    },
    model: "翻訳で使用するモデル",
    systemPrompt: "システムプロンプト",
    translationPrompt: "翻訳時に使うプロンプト",
    ollamaBaseUrlPrefix: "Ollamaのリクエストを送る",
    ollamaKeepAlivePrefix: "Ollamaのリクエストで使う",
    ollamaKeepAliveSuffix: "の値（オプション）",
    ollamaKeepAliveDescriptionPrefix:
      "OllamaがLLMを読み込んだ後、どれだけメモリ上に展開し続けるかを指定できます。詳しい情報は",
    ollamaKeepAliveDescriptionLink: "こちら",
    ollamaKeepAliveDescriptionSuffix: "をご確認ください。例:",
    defaultSourceLanguage: "デフォルトの翻訳元",
    defaultSourceLanguageDescription:
      "起動時に選択される翻訳元の言語を指定できます。",
    defaultTargetLanguage: "デフォルトの翻訳先",
    defaultTargetLanguageDescription:
      "起動時などに選択される翻訳先の言語を指定できます。",
    fallbackTargetLanguage: "フォールバックの翻訳先",
    fallbackTargetLanguageDescription:
      "自動検出でその時の翻訳先と元が被った時に、翻訳先を別の言語にできます。",
    languageListScope: "言語選択に表示する言語",
    detectionLanguageScope: "自動検出の対象とする言語",
    detectionLanguageScopeDescription:
      "言語検出で指定した言語のみを検出対象にできます。処理が遅い場合に絞り込むことができます。",
    detectionFallback: "自動検出のフォールバック先",
    detectionFallbackDescription:
      "自動検出で検出に失敗した時に、翻訳元として使う言語を別の言語にできます。",
    customLanguageList: "表示する言語",
  },
  language: {
    autoDetect: "自動検出",
    scopes: {
      all: "全ての言語",
      common: "主要な言語",
      custom: "選択した言語のみ",
    },
  },
  llm: {
    noModels: "モデルが一つも見つかりませんでした",
    noModelSelected: "モデルを選択してください",
    refreshModels: "モデル一覧を再読み込み",
    loadingModels: "モデル一覧を読み込み中です",
    providerConnectionFailed:
      "{{provider}}に接続できません。下にある base_url の設定を確認してください。",
    selectedModelUnavailable:
      "選択中のモデルが現在のモデル一覧に見つかりません。モデル一覧を再読み込みしてください。",
    resetPromptConfirm: "本当に翻訳時に使うプロンプトをリセットしますか？",
    promptVariablesIntro: "プロンプトには以下を埋め込むことができます。",
    variables: {
      sourceLang: "選択または検出された翻訳前の言語名",
      sourceCode: "選択または検出された翻訳前の言語コード",
      targetLang: "選択された翻訳後の言語名",
      targetCode: "選択または翻訳後の言語コード",
      text: "翻訳対象のテキスト",
    },
    resetPrompt: "最初の状態に戻す",
  },
  translation: {
    inputPlaceholder: "翻訳したいテキストを入力",
    inputClear: "入力を削除",
    noModel:
      "現在、翻訳を処理するAIモデルが設定されていません。設定後、翻訳が可能となります。",
    failed: "翻訳に失敗しました。",
    unavailable: "翻訳を開始できません。",
    providerUnavailable:
      "{{provider}}に接続できないため、翻訳を開始できません。設定の base_url を確認してください。",
    placeholder: "翻訳結果はこちらに表示されます。",
    requesting: "リクエスト中です",
    copy: "クリップボードにコピー",
    swapLanguages: "言語を入れ替え",
  },
} as const;
