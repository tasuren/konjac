import { cn } from "@sglara/cn";
import { ArrowRightLeft, ChevronDown } from "lucide-react";
import {
  type ChangeEvent,
  type OptionHTMLAttributes,
  type SelectHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LanguageInfoDto } from "../../../rust-bindings/LanguageInfoDto";
import type { ModelDto } from "../../../rust-bindings/ModelDto";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import { useWindowDragging } from "../../../shared/hooks/useWindowDragging";
import { listLanguages, listModels } from "../../../shared/tauri/translation";
import {
  type TranslationModelSelection,
  useTranslationSelectionStore,
} from "../stores/translationSelectionStore";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "appearance-none",
          "border border-border bg-surface-elevated rounded-lg px-2 py-1 pr-8",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown className="h-4 w-4 opacity-60" />
      </div>
    </div>
  );
}

export default function TranslationControls() {
  const srcLangRef = useRef(null);
  const srcLangClassName = useWindowDragging(srcLangRef);
  const targetLangRef = useRef(null);
  const targetLangClassName = useWindowDragging(targetLangRef);

  // TODO: Move them to global store?
  const [languages, setLanguages] = useState<LanguageInfoDto[]>([]);
  useEffect(() => {
    (async () => {
      const languages = await listLanguages();
      languages.sort((a, b) => a.name.localeCompare(b.name));
      setLanguages(languages);
    })();
  }, []);

  return (
    <div className="flex items-center gap-6 relative">
      <div
        className={cn("w-1/2 flex justify-end px-2", srcLangClassName)}
        ref={srcLangRef}
      >
        <SourceLanguageSelect languages={languages} />
      </div>

      <div
        className={cn("w-1/2 flex justify-between px-2", targetLangClassName)}
        ref={targetLangRef}
      >
        <TargetLanguageSelect languages={languages} />

        <ModelSelect />
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
        setSourceLanguage({ type: "autoDetect" });
        return;
      }

      for (const language of languages) {
        if (language.code === selected) {
          setSourceLanguage({ type: "manual", ...language });
          break;
        }
      }
    },
    [languages, setSourceLanguage],
  );

  return (
    <Select
      className="w-40"
      value={
        sourceLanguage.type === "autoDetect"
          ? "auto-detection"
          : sourceLanguage.code
      }
      onChange={onSelectSrcLang}
    >
      <AutoDetectionOption
        resolved={resolvedSourceLanguage}
        value="auto-detection"
      />
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

function AutoDetectionOption({
  resolved,
  ...props
}: OptionHTMLAttributes<HTMLOptionElement> & {
  resolved: ResolvedSourceLanguageDto | null;
}) {
  return (
    <option {...props}>
      自動検出
      {resolved && ` (${resolved.name})`}
    </option>
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

function ModelSelect() {
  const [models, setModels] = useState<Map<string, ModelDto>>(new Map());
  const [firstModel, setFirstModel] = useState<ModelDto | null>(null);
  const { model, setModel } = useTranslationSelectionStore();

  const genKey = useCallback(
    (model: TranslationModelSelection) => `${model.provider}-${model.id}`,
    [],
  );

  useEffect(() => {
    (async () => {
      const models = await listModels();
      if (models.length > 0) setFirstModel(models[0]);

      setModels(new Map(models.map((model) => [genKey(model), model])));
    })();
  }, [genKey]);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = models.get(event.currentTarget.value);
      if (selected === undefined) return;
      setModel(selected);
    },
    [models, setModel],
  );

  if (models.size === 0 || firstModel === null)
    return (
      <Select>
        <option disabled={true}>モデル未設定</option>
      </Select>
    );

  return (
    <Select value={genKey(model ?? firstModel)} onChange={onChange}>
      {Array.from(models).map(([key, model]) => (
        <option key={key} value={key}>
          {model.displayName ?? model.id}
        </option>
      ))}
    </Select>
  );
}
