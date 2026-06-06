import { X } from "lucide-react";
import { useEffect } from "react";
import { IconButton } from "../../shared/components/IconButton";
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
                  Ollamaの<code>base_url</code>
                </>
              }
            >
              <OllamaBaseUrl name="ollama-base-url" id="ollama-base-url" />
            </SettingsField>

            <SettingsField
              htmlFor="ollama-keep-alive"
              label={
                <>
                  Ollamaの<code>keep_alive</code>
                </>
              }
            >
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
              <SourceLanguageSelect
                name="default-source-language"
                id="default-source-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="default-target-language-select"
              label="デフォルトの翻訳先"
            >
              <TargetLanguageSelect
                name="default-target-language"
                id="default-target-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="fallback-target-language-select"
              label="フォールバックの翻訳先"
            >
              <p className="my-1 text-sm">
                自動検出でその時の翻訳先と元が被った時に、翻訳先を別の言語にできます。
              </p>

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
              <LanguageDetectionScopeSelect
                name="detection-list-scope"
                id="detection-list-scope-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="detection-fallback-select"
              label="自動検出のフォールバック先"
            >
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
