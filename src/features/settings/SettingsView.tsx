import { X } from "lucide-react";
import { useEffect } from "react";
import { IconButton } from "../../shared/components/IconButton";
import { OpenInBrowser } from "../../shared/components/OpenInBrowser";
import { TitleBar } from "../../shared/components/TitleBar";
import { ThemeSelect } from "./components/BasicSettings";
import {
  FallbackTargetLanguageSelect,
  LanguageDetectionFallbackSelect,
  LanguageDetectionScopeSelect,
  LanguageListScopeSelect,
  SourceLanguageSelect,
  TargetLanguageSelect,
} from "./components/LanguageSettings";
import {
  ModelSelect,
  OllamaBaseUrl,
  OllamaKeepAlive,
  SystemPromptTextArea,
  TranslationPromptTextArea,
} from "./components/LlmSettings";
import { SettingsDescription } from "./components/SettingsDescription";
import { SettingsField } from "./components/SettingsField";
import { SettingsSection } from "./components/SettingsSection";

export function SettingsView({
  setSettings,
}: {
  setSettings: (settings: boolean) => void;
}) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSettings(false);
      }
    };

    addEventListener("keydown", handleEscape);

    return () => {
      removeEventListener("keydown", handleEscape);
    };
  }, [setSettings]);

  return (
    <div className="absolute top-0 left-0 z-10 flex h-screen w-screen flex-col bg-bg">
      <TitleBar>
        <div className="flex h-full items-center">
          <div>翻訳設定</div>

          <div className="ml-auto flex items-center px-2.5">
            <IconButton
              className="text-text hover:bg-transparent"
              onClick={() => setSettings(false)}
              aria-label="設定を閉じる"
            >
              <X size={23} />
            </IconButton>
          </div>
        </div>
      </TitleBar>

      <div className="w-full overflow-y-auto">
        <main className="mx-auto min-h-0 max-w-[70ch] grow space-y-8 p-6">
          <SettingsSection title="全般">
            <SettingsField htmlFor="theme-select" label="テーマ">
              <ThemeSelect name="theme" id="theme-select" />
            </SettingsField>
          </SettingsSection>

          <SettingsSection title="LLM">
            <SettingsField htmlFor="model-select" label="翻訳で使用するモデル">
              <ModelSelect name="model" id="model-select" />
            </SettingsField>

            <SettingsField htmlFor="system-prompt" label="システムプロンプト">
              <SystemPromptTextArea name="system-prompt" id="system-prompt" />
            </SettingsField>

            <SettingsField
              htmlFor="translation-prompt"
              label="翻訳時に使うプロンプト"
            >
              <TranslationPromptTextArea
                name="translation-prompt"
                id="translation-prompt"
              />
            </SettingsField>

            <SettingsField
              htmlFor="ollama-base-url"
              label={
                <>
                  Ollamaのリクエストを送る<code className="px-1">base_url</code>
                </>
              }
            >
              <OllamaBaseUrl name="ollama-base-url" id="ollama-base-url" />
            </SettingsField>

            <SettingsField
              htmlFor="ollama-keep-alive"
              label={
                <>
                  Ollamaのリクエストで使う
                  <code className="px-1">keep_alive</code>
                  の値（オプション）
                </>
              }
            >
              <SettingsDescription>
                OllamaがLLMを読み込んだ後、どれだけメモリ上に展開し続けるかを指定できます。
                詳しい情報は
                <OpenInBrowser href="https://docs.ollama.com/faq#how-do-i-keep-a-model-loaded-in-memory-or-make-it-unload-immediately">
                  こちら
                </OpenInBrowser>
                をご確認ください。 例: <code>3h</code>
              </SettingsDescription>

              <OllamaKeepAlive
                name="ollama-keep-alive"
                id="ollama-keep-alive"
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection title="言語">
            <SettingsField
              htmlFor="default-source-language-select"
              label="デフォルトの翻訳元"
            >
              <SettingsDescription>
                起動時に選択される翻訳元の言語を指定できます。
              </SettingsDescription>

              <SourceLanguageSelect
                name="default-source-language"
                id="default-source-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="default-target-language-select"
              label="デフォルトの翻訳先"
            >
              <SettingsDescription>
                起動時などに選択される翻訳先の言語を指定できます。
              </SettingsDescription>

              <TargetLanguageSelect
                name="default-target-language"
                id="default-target-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="fallback-target-language-select"
              label="フォールバックの翻訳先"
            >
              <SettingsDescription>
                自動検出でその時の翻訳先と元が被った時に、翻訳先を別の言語にできます。
              </SettingsDescription>

              <FallbackTargetLanguageSelect
                name="fallback-target-language"
                id="fallback-target-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="language-list-scope-select"
              label="言語選択に表示する言語"
            >
              <LanguageListScopeSelect
                name="language-list-scope"
                id="language-list-scope-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="detection-list-scope-select"
              label="自動検出の対象とする言語"
            >
              <SettingsDescription>
                言語検出で指定した言語のみを検出対象にできます。
                処理が遅い場合に絞り込むことができます。
              </SettingsDescription>

              <LanguageDetectionScopeSelect
                name="detection-list-scope"
                id="detection-list-scope-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="detection-fallback-select"
              label="自動検出のフォールバック先"
            >
              <SettingsDescription>
                自動検出で検出に失敗した時に、翻訳元として使う言語を別の言語にできます。
              </SettingsDescription>

              <LanguageDetectionFallbackSelect
                name="detection-fallback"
                id="detection-fallback-select"
              />
            </SettingsField>
          </SettingsSection>
        </main>
      </div>
    </div>
  );
}
