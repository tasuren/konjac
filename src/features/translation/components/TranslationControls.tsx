import { ArrowRightLeft, ArrowUpRight } from "lucide-react";
import { type ChangeEvent, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../../../shared/components/IconButton";
import { Select } from "../../../shared/components/Select";
import { useLanguageDisplay } from "../../../shared/i18n/languageDisplay";
import { useProviderModelCatalog } from "../../../shared/stores/modelCatalogStore";
import { useSettingsStore } from "../../../shared/stores/settingsStore";
import { getLanguage } from "../../../shared/tauri/language";
import { useLanguageCatalog } from "../hooks/useLanguageCatalog";
import { useTranslationSelectionStore } from "../stores/translationLanguageStore";

export function TranslationControls({
  swapDisabled,
  onSwap,
  focusModelSelect,
}: {
  swapDisabled: boolean;
  onSwap: () => void;
  focusModelSelect: () => void;
}) {
  const { t } = useTranslation();
  const model = useSettingsStore((state) => state.model);

  const { models } = useProviderModelCatalog("ollama");
  const modelDisplay = useMemo(() => {
    if (model === null) return null;
    const info = models.find((m) => m.id === model.id);
    return info?.displayName ?? model.id;
  }, [models, model]);

  return (
    <div className="flex items-center justify-between gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="grid min-w-0 grid-cols-[minmax(8rem,1fr)_auto_minmax(8rem,1fr)] items-center gap-3 md:col-start-2">
        <div className="min-w-0 max-w-49.5 justify-self-end">
          <SourceLanguageSelect />
        </div>

        <IconButton
          className="active:opacity-60"
          disabled={swapDisabled}
          onClick={onSwap}
          title={t("translation.swapLanguages")}
          aria-label={t("translation.swapLanguages")}
        >
          <ArrowRightLeft size={26} />
        </IconButton>

        <div className="min-w-0 max-w-49.5 justify-self-start">
          <TargetLanguageSelect />
        </div>
      </div>

      <div className="min-w-0 text-muted md:col-start-3">
        <button
          type="button"
          className="flex w-full items-center justify-end gap-0.5 hover:underline"
          onClick={focusModelSelect}
        >
          <span className="min-w-0 truncate">
            {modelDisplay === null ? t("llm.noModelSelected") : modelDisplay}
          </span>
          <ArrowUpRight className="shrink-0" size={16} />
        </button>
      </div>
    </div>
  );
}

function SourceLanguageSelect() {
  const sourceLanguage = useTranslationSelectionStore(
    (state) => state.sourceLanguage,
  );
  const resolvedSourceLanguage = useTranslationSelectionStore(
    (state) => state.resolvedSourceLanguage,
  );
  const setSourceLanguage = useTranslationSelectionStore(
    (state) => state.setSourceLanguage,
  );
  const { languages } = useLanguageCatalog();
  const { t } = useTranslation();
  const languageDisplay = useLanguageDisplay();
  const resolvedLanguage =
    resolvedSourceLanguage === null
      ? undefined
      : getLanguage(resolvedSourceLanguage.code);

  const onSelectSrcLang = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;

      if (selected === "auto-detection") {
        setSourceLanguage({ type: "auto_detect" });
        return;
      }

      setSourceLanguage({ type: "manual", code: selected });
    },
    [setSourceLanguage],
  );

  return (
    <Select
      containerClassName="w-full min-w-0"
      className="w-full min-w-0 truncate"
      value={
        sourceLanguage.type === "auto_detect"
          ? "auto-detection"
          : sourceLanguage.code
      }
      onChange={onSelectSrcLang}
    >
      <option value="auto-detection">
        {t("language.autoDetect")}
        {resolvedSourceLanguage &&
          ` (${resolvedLanguage !== undefined ? languageDisplay.name(resolvedLanguage) : resolvedSourceLanguage.code})`}
      </option>

      {languageDisplay.sort(languages).map((lang) => (
        <option key={lang.code} value={lang.code}>
          {languageDisplay.name(lang)}
        </option>
      ))}
    </Select>
  );
}

function TargetLanguageSelect() {
  const targetLanguage = useTranslationSelectionStore(
    (state) => state.targetLanguage,
  );
  const setTargetLanguage = useTranslationSelectionStore(
    (state) => state.setTargetLanguage,
  );
  const { languages } = useLanguageCatalog();
  const languageDisplay = useLanguageDisplay();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      setTargetLanguage(selected);
    },
    [setTargetLanguage],
  );

  return (
    <Select
      containerClassName="w-full min-w-0"
      className="w-full min-w-0 truncate"
      value={targetLanguage}
      onChange={onChange}
    >
      {languageDisplay.sort(languages).map((lang) => (
        <option key={lang.code} value={lang.code}>
          {languageDisplay.name(lang)}
        </option>
      ))}
    </Select>
  );
}
