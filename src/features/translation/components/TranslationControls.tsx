import { ArrowRightLeft } from "lucide-react";
import { type ChangeEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "../../../shared/components/Select";
import { useLanguageDisplay } from "../../../shared/i18n/languageDisplay";
import { getLanguage } from "../../../shared/tauri/language";
import { useLanguageCatalog } from "../hooks/useLanguageCatalog";
import { useTranslationSelectionStore } from "../stores/translationLanguageStore";

export function TranslationControls() {
  return (
    <div className="flex items-center gap-6 relative pointer-events-none [&>*>*]:pointer-events-auto">
      <div className="w-1/2 flex justify-end px-2">
        <SourceLanguageSelect />
      </div>

      <div className="w-1/2 flex justify-between px-2">
        <TargetLanguageSelect />
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <button type="button" className="active:opacity-60">
          <ArrowRightLeft size={26} className="opacity-60" />
        </button>
      </div>
    </div>
  );
}

function SourceLanguageSelect() {
  const { sourceLanguage, resolvedSourceLanguage, setSourceLanguage } =
    useTranslationSelectionStore();
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
  const { targetLanguage, setTargetLanguage } = useTranslationSelectionStore();
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
    <Select value={targetLanguage} onChange={onChange}>
      {languageDisplay.sort(languages).map((lang) => (
        <option key={lang.code} value={lang.code}>
          {languageDisplay.name(lang)}
        </option>
      ))}
    </Select>
  );
}
