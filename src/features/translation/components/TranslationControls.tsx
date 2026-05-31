import { ArrowRightLeft } from "lucide-react";
import { type ChangeEvent, useCallback } from "react";
import { Select } from "../../../shared/components/Select";
import { getLanguage } from "../../../shared/tauri/language";
import { useLanguageCatalog } from "../hooks/useLanguageCatalog";
import { useTranslationSelectionStore } from "../stores/translationLanguageStore";

export default function TranslationControls() {
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
      className="w-40"
      value={
        sourceLanguage.type === "auto_detect"
          ? "auto-detection"
          : sourceLanguage.code
      }
      onChange={onSelectSrcLang}
    >
      <option value="auto-detection">
        自動検出
        {resolvedSourceLanguage &&
          ` (${getLanguage(resolvedSourceLanguage.code)?.name ?? resolvedSourceLanguage.code})`}
      </option>

      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

function TargetLanguageSelect() {
  const { targetLanguage, setTargetLanguage } = useTranslationSelectionStore();
  const { languages } = useLanguageCatalog();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      setTargetLanguage(selected);
    },
    [setTargetLanguage],
  );

  return (
    <Select className="w-40" value={targetLanguage} onChange={onChange}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}
