import { cn } from "@sglara/cn";
import { Trash2, X } from "lucide-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { DetectableLanguageDto } from "../../rust-bindings/DetectableLanguageDto";
import type { LanguageCodeDto } from "../../rust-bindings/LanguageCodeDto";
import type { LanguageDetectionScopeSettingDto } from "../../rust-bindings/LanguageDetectionScopeSettingDto";
import type { LanguageInfoDto } from "../../rust-bindings/LanguageInfoDto";
import type { LanguageListScopeSettingDto } from "../../rust-bindings/LanguageListScopeSettingDto";
import type { ModelDto } from "../../rust-bindings/ModelDto";
import type { ModelSelectionDto } from "../../rust-bindings/ModelSelectionDto";
import type { SettingsDto } from "../../rust-bindings/SettingsDto";
import type { ThemeSettingDto } from "../../rust-bindings/ThemeSettingDto";
import { Select, type SelectProps } from "../../shared/components/Select";
import { TitleBar } from "../../shared/components/TitleBar";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import {
  COMMON_LANGUAGES,
  filterWithDetectable,
  getLanguage,
  LANGUAGES,
} from "../../shared/tauri/language";
import { listAvailableModels } from "../../shared/tauri/translation";
import { useLanguageCatalog } from "../translation/hooks/useLanguageCatalog";

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
    <div className="absolute top-0 left-0 z-10 h-screen w-screen bg-bg flex flex-col">
      <TitleBar>
        <div className="h-full flex items-center">
          <div>翻訳設定</div>

          <div className="ml-auto px-2.5 flex items-center">
            <button
              type="button"
              className="active:opacity-70"
              onClick={() => setSettings(false)}
            >
              <X size={23} className="text-text" />
            </button>
          </div>
        </div>
      </TitleBar>

      <div className="overflow-y-auto w-full">
        <main className="grow min-h-0 p-6 max-w-[70ch] mx-auto">
          <h1 className="text-2xl mb-4">全般</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="theme-select">テーマ</label>
              <ThemeSelect name="theme" id="theme-select" />
            </div>
          </div>

          <h1 className="text-2xl mt-8 mb-4">翻訳設定</h1>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="model-select">翻訳で使用するモデル</label>
              <ModelSelect name="model" id="model-select" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="default-source-language-select">
                デフォルトの翻訳前の言語
              </label>
              <SourceLanguageSelect
                name="default-source-language"
                id="default-source-language-select"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="default-target-language-select">
                デフォルトの翻訳後の言語
              </label>
              <TargetLanguageSelect
                name="default-target-language"
                id="default-target-language-select"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="language-list-scope-select">
                言語選択に表示する言語
              </label>
              <LanguageListScopeSelect
                name="language-list-scope"
                id="language-list-scope-select"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="detection-list-scope-select">
                自動検出の対象とする言語
              </label>
              <LanguageDetectionScopeSelect
                name="detection-list-scope"
                id="detection-list-scope-select"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ThemeSelect(props: SelectProps) {
  const { theme, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      if (selected !== "light" && selected !== "dark" && selected !== "system")
        throw "Invalid theme was set on options";
      updateSettings((settings: SettingsDto) => ({
        ...settings,
        theme: selected as ThemeSettingDto,
      }));
    },
    [updateSettings],
  );

  return (
    <Select value={theme} onChange={onChange} {...props}>
      <option value="dark">ダーク</option>
      <option value="light">ライト</option>
      <option value="system">システムに合わせる</option>
    </Select>
  );
}

function genModelKey(model: ModelSelectionDto) {
  return `${model.provider}-${model.id}`;
}

function ModelSelect(props: SelectProps) {
  const [models, setModels] = useState<Map<string, ModelDto>>(new Map());
  const { model, updateSettings } = useSettingsStore();

  useEffect(() => {
    const fetchModels = async () => {
      const availableModels = await listAvailableModels();
      setModels(
        new Map(availableModels.map((model) => [genModelKey(model), model])),
      );
    };

    void fetchModels();
  }, []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = models.get(event.currentTarget.value);
      if (selected === undefined) return;
      updateSettings((settings) => ({
        ...settings,
        model: selected,
      }));
    },
    [models, updateSettings],
  );

  if (models.size === 0 || model === null)
    return (
      <Select>
        <option disabled={true}>モデルが一つも見つかりませんでした</option>
      </Select>
    );

  return (
    <Select value={genModelKey(model)} onChange={onChange} {...props}>
      {Array.from(models).map(([key, model]) => (
        <option key={key} value={key}>
          {model.displayName ?? model.id}
        </option>
      ))}
    </Select>
  );
}

function SourceLanguageSelect(props: SelectProps) {
  const { defaultSourceLanguage, updateSettings } = useSettingsStore();
  const { languages } = useLanguageCatalog();

  const onSelectSrcLang = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;

      if (selected === "auto-detect") {
        updateSettings((settings) => ({
          ...settings,
          defaultSourceLanguage: { type: "auto_detect" },
        }));
        return;
      }

      updateSettings((settings) => ({
        ...settings,
        defaultSourceLanguage: { type: "manual", code: selected },
      }));
    },
    [updateSettings],
  );

  return (
    <Select
      className="w-40"
      value={
        defaultSourceLanguage.type === "auto_detect"
          ? "auto-detect"
          : defaultSourceLanguage.code
      }
      onChange={onSelectSrcLang}
      {...props}
    >
      <option value="auto-detect">自動検出</option>

      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

function TargetLanguageSelect(props: SelectProps) {
  const { defaultTargetLanguage, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      updateSettings((settings) => ({
        ...settings,
        defaultTargetLanguage: selected,
      }));
    },
    [updateSettings],
  );

  return (
    <Select
      className="w-40"
      value={defaultTargetLanguage}
      onChange={onChange}
      {...props}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

function LanguageListScopeSelect(props: SelectProps) {
  const { languageListScope, customLanguageListScope, updateSettings } =
    useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      updateSettings((settings) => ({
        ...settings,
        languageListScope: event.currentTarget
          .value as LanguageListScopeSettingDto,
      }));
    },
    [updateSettings],
  );

  const setCustomLanguageList = useCallback(
    (languages: LanguageCodeDto[]) => {
      updateSettings((settings) => ({
        ...settings,
        customLanguageListScope: languages,
      }));
    },
    [updateSettings],
  );

  return (
    <>
      <Select
        className="w-40"
        onChange={onChange}
        value={languageListScope}
        {...props}
      >
        <option value="all">全ての言語</option>
        <option value="common">主要な言語</option>
        <option value="custom">選択した言語のみ</option>
      </Select>

      {languageListScope === "common" && <CommonLanguageNotice />}

      {languageListScope === "custom" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-language-select" className="text-sm">
            表示する言語
          </label>

          <LanguageList
            catalog={LANGUAGES}
            languageList={customLanguageListScope}
            setLanguageList={setCustomLanguageList}
          />
        </div>
      )}
    </>
  );
}

function LanguageDetectionScopeSelect(props: SelectProps) {
  const { autoDetection, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      updateSettings((settings) => ({
        ...settings,
        autoDetection: {
          ...autoDetection,
          scope: event.currentTarget.value as LanguageDetectionScopeSettingDto,
        },
      }));
    },
    [autoDetection, updateSettings],
  );

  const setDetectionLanguageList = useCallback(
    (languages: LanguageCodeDto[]) => {
      updateSettings((settings) => ({
        ...settings,
        autoDetection: {
          ...autoDetection,
          customDetectionScope: languages as DetectableLanguageDto[],
        },
      }));
    },
    [updateSettings, autoDetection],
  );

  return (
    <>
      <Select
        className="w-40"
        onChange={onChange}
        value={autoDetection.scope}
        {...props}
      >
        <option value="all">全ての言語</option>
        <option value="common">主要な言語</option>
        <option value="custom">選択した言語のみ</option>
      </Select>

      {autoDetection.scope === "common" && <CommonLanguageNotice />}

      {autoDetection.scope === "custom" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-language-select" className="text-sm">
            表示する言語
          </label>

          <LanguageList
            catalog={filterWithDetectable("all")}
            languageList={autoDetection.customDetectionScope}
            setLanguageList={setDetectionLanguageList}
          />
        </div>
      )}
    </>
  );
}

function CommonLanguageNotice() {
  return (
    <div className="text-sm text-muted">
      {COMMON_LANGUAGES.map((l) => l.name).join("、")}
    </div>
  );
}

function LanguageList({
  catalog,
  languageList,
  setLanguageList,
}: {
  catalog: LanguageInfoDto[];
  languageList: LanguageCodeDto[];
  setLanguageList: (languages: LanguageCodeDto[]) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const onRemoveLanguage = useCallback(
    (code: string) => {
      if (languageList.length === 1) return;

      setLanguageList(languageList.filter((c) => c !== code));
    },
    [languageList, setLanguageList],
  );

  const onAddLanguage = useCallback(() => {
    const code = selectRef.current?.value;
    if (code === undefined) return;
    if (languageList.includes(code)) return;

    setLanguageList([...languageList, code]);
  }, [languageList, setLanguageList]);

  return (
    <div className="border border-border rounded-lg w-fit p-3.5 space-y-4">
      <ul className="space-y-2 pl-2">
        {languageList?.map((code) => {
          const language = getLanguage(code);
          const lastOne = languageList.length <= 1;

          return (
            language && (
              <li key={language.code} className="flex justify-between">
                {language.name}

                {!lastOne && (
                  <button
                    type="button"
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-md",
                      "text-muted hover:bg-surface hover:text-text",
                      "disabled:pointer-events-none disabled:opacity-40",
                    )}
                    disabled={lastOne}
                    title="削除"
                    aria-label="削除"
                    onClick={() => onRemoveLanguage(language.code)}
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
              </li>
            )
          );
        })}
      </ul>

      <div className="flex gap-4 w-fit">
        <Select
          id="custom-language-select"
          className="w-40"
          defaultValue="en"
          ref={selectRef}
        >
          {catalog
            .filter(
              (language) =>
                !languageList.some((code) => code === language.code),
            )
            .map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
        </Select>

        <button
          type="button"
          onClick={onAddLanguage}
          className="border border-border px-2 rounded-lg bg-surface-elevated"
        >
          追加
        </button>
      </div>
    </div>
  );
}
