import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { OpenInBrowser } from "../../shared/components/OpenInBrowser";
import { TitleBar } from "../../shared/components/TitleBar";
import { AppLocaleSelect, ThemeSelect } from "./components/BasicSettings";
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
  focus,
}: {
  setSettings: (settings: boolean) => void;
  focus?: "model-select";
}) {
  const { t } = useTranslation();

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

  useEffect(() => {
    if (focus === undefined) return;
    const modelSelect = document.getElementById("model-select");
    if (modelSelect) modelSelect.focus();
  }, [focus]);

  return (
    <div className="absolute top-0 left-0 z-10 flex h-screen w-screen flex-col bg-bg">
      <TitleBar settingsOpened={true} setSettings={setSettings} />

      <div className="w-full overflow-y-auto">
        <main className="mx-auto min-h-0 max-w-[70ch] grow space-y-8 px-4 py-8">
          <SettingsSection title={t("settings.general")}>
            <SettingsField htmlFor="theme-select" label={t("settings.theme")}>
              <ThemeSelect name="theme" id="theme-select" />
            </SettingsField>

            <SettingsField
              htmlFor="app-locale-select"
              label={t("settings.displayLanguage")}
            >
              <AppLocaleSelect name="app-locale" id="app-locale-select" />
            </SettingsField>
          </SettingsSection>

          <SettingsSection title="LLM">
            <SettingsField htmlFor="model-select" label={t("settings.model")}>
              <ModelSelect name="model" id="model-select" />
            </SettingsField>

            <SettingsField
              htmlFor="system-prompt"
              label={t("settings.systemPrompt")}
            >
              <SystemPromptTextArea name="system-prompt" id="system-prompt" />
            </SettingsField>

            <SettingsField
              htmlFor="translation-prompt"
              label={t("settings.translationPrompt")}
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
                  {t("settings.ollamaBaseUrlPrefix")}
                  <code className="px-1">base_url</code>
                </>
              }
            >
              <OllamaBaseUrl name="ollama-base-url" id="ollama-base-url" />
            </SettingsField>

            <SettingsField
              htmlFor="ollama-keep-alive"
              label={
                <>
                  {t("settings.ollamaKeepAlivePrefix")}
                  <code className="px-1">keep_alive</code>
                  {t("settings.ollamaKeepAliveSuffix")}
                </>
              }
            >
              <SettingsDescription>
                {t("settings.ollamaKeepAliveDescriptionPrefix")}
                <OpenInBrowser href="https://docs.ollama.com/faq#how-do-i-keep-a-model-loaded-in-memory-or-make-it-unload-immediately">
                  {t("settings.ollamaKeepAliveDescriptionLink")}
                </OpenInBrowser>
                {t("settings.ollamaKeepAliveDescriptionSuffix")} <code>3h</code>
              </SettingsDescription>

              <OllamaKeepAlive
                name="ollama-keep-alive"
                id="ollama-keep-alive"
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection title={t("settings.language")}>
            <SettingsField
              htmlFor="default-source-language-select"
              label={t("settings.defaultSourceLanguage")}
            >
              <SettingsDescription>
                {t("settings.defaultSourceLanguageDescription")}
              </SettingsDescription>

              <SourceLanguageSelect
                name="default-source-language"
                id="default-source-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="default-target-language-select"
              label={t("settings.defaultTargetLanguage")}
            >
              <SettingsDescription>
                {t("settings.defaultTargetLanguageDescription")}
              </SettingsDescription>

              <TargetLanguageSelect
                name="default-target-language"
                id="default-target-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="fallback-target-language-select"
              label={t("settings.fallbackTargetLanguage")}
            >
              <SettingsDescription>
                {t("settings.fallbackTargetLanguageDescription")}
              </SettingsDescription>

              <FallbackTargetLanguageSelect
                name="fallback-target-language"
                id="fallback-target-language-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="language-list-scope-select"
              label={t("settings.languageListScope")}
            >
              <LanguageListScopeSelect
                name="language-list-scope"
                id="language-list-scope-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="detection-list-scope-select"
              label={t("settings.detectionLanguageScope")}
            >
              <SettingsDescription>
                {t("settings.detectionLanguageScopeDescription")}
              </SettingsDescription>

              <LanguageDetectionScopeSelect
                name="detection-list-scope"
                id="detection-list-scope-select"
              />
            </SettingsField>

            <SettingsField
              htmlFor="detection-fallback-select"
              label={t("settings.detectionFallback")}
            >
              <SettingsDescription>
                {t("settings.detectionFallbackDescription")}
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
