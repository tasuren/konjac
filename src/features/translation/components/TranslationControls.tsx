import { ArrowRightLeft } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import type { LanguageInfoDto } from "../../../rust-bindings/LanguageInfoDto";
import { Select } from "../../../shared/components/Select";
import { listAvailableLanguages } from "../../../shared/tauri/translation";
import { useTranslationSelectionStore } from "../stores/translationLanguageStore";

export default function TranslationControls() {
  // TODO: Move them to global store?
  const [languages, setLanguages] = useState<LanguageInfoDto[]>([]);
  useEffect(() => {
    const fetchLanguages = async () => {
      const languages = await listAvailableLanguages();
      languages.sort((a, b) => a.name.localeCompare(b.name));
      setLanguages(languages);
    };

    void fetchLanguages();
  }, []);

  return (
    <div className="flex items-center gap-6 relative pointer-events-none [&>*>*]:pointer-events-auto">
      <div className="w-1/2 flex justify-end px-2">
        <SourceLanguageSelect languages={languages} />
      </div>

      <div className="w-1/2 flex justify-between px-2">
        <TargetLanguageSelect languages={languages} />
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <button type="button" className="active:opacity-60">
          <ArrowRightLeft size={26} className="opacity-60" />
        </button>
      </div>
    </div>
  );
}

function SourceLanguageSelect({ languages }: { languages: LanguageInfoDto[] }) {
  const { sourceLanguage, resolvedSourceLanguage, setSourceLanguage } =
    useTranslationSelectionStore();

  const onSelectSrcLang = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;

      if (selected === "auto-detection") {
        setSourceLanguage({ type: "auto_detect" });
        return;
      }

      const language = languages.find((lang) => lang.code === selected);
      if (!language) return; // TODO: handle not found
      setSourceLanguage({ type: "manual", ...language });
    },
    [languages, setSourceLanguage],
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
        {resolvedSourceLanguage && ` (${resolvedSourceLanguage.name})`}
      </option>

      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

function TargetLanguageSelect({ languages }: { languages: LanguageInfoDto[] }) {
  const { targetLanguage, setTargetLanguage } = useTranslationSelectionStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;

      for (const language of languages) {
        if (language.code === selected) {
          setTargetLanguage(language);
          break;
        }
      }
    },
    [languages, setTargetLanguage],
  );

  return (
    <Select className="w-40" value={targetLanguage.code} onChange={onChange}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}
