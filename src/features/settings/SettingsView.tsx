import { X } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import type { LanguageInfoDto } from "../../rust-bindings/LanguageInfoDto";
import type { ModelDto } from "../../rust-bindings/ModelDto";
import type { ModelSelectionDto } from "../../rust-bindings/ModelSelectionDto";
import type { SettingsDto } from "../../rust-bindings/SettingsDto";
import type { ThemeSettingDto } from "../../rust-bindings/ThemeSettingDto";
import { Select, type SelectProps } from "../../shared/components/Select";
import { TitleBar } from "../../shared/components/TitleBar";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import {
  listAvailableLanguages,
  listAvailableModels,
} from "../../shared/tauri/translation";

export function SettingsView({
  setSettings,
}: {
  setSettings: (settings: boolean) => void;
}) {
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

      <main className="grow min-h-0 p-6 min-w-[60ch] mx-auto">
        <h1 className="text-2xl mb-4">全般</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="theme-select">テーマ</label>
            <ThemeSelect name="theme" id="theme-select" />
          </div>
        </div>

        <h1 className="text-2xl mt-8 mb-4">翻訳設定</h1>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="model-select">翻訳で使用するモデル</label>
            <ModelSelect name="model" id="model-select" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="default-source-language">
              デフォルトの翻訳前の言語
            </label>
            <SourceLanguageSelect
              languages={languages}
              name="default-source-language"
              id="default-source-language-select"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="defaultTargetLanguage">
              デフォルトの翻訳後の言語
            </label>
            <TargetLanguageSelect
              languages={languages}
              name="default-target-language"
              id="default-target-language-select"
            />
          </div>
        </div>
      </main>
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

function SourceLanguageSelect({
  languages,
  ...props
}: { languages: LanguageInfoDto[] } & SelectProps) {
  const { defaultSourceLanguage, updateSettings } = useSettingsStore();

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

      const language = languages.find((lang) => lang.code === selected);
      if (!language) return; // TODO: handle not found

      updateSettings((settings) => ({
        ...settings,
        defaultSourceLanguage: { type: "manual", ...language },
      }));
    },
    [languages, updateSettings],
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

function TargetLanguageSelect({
  languages,
  ...props
}: { languages: LanguageInfoDto[] } & SelectProps) {
  const { defaultTargetLanguage, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      const language = languages.find((lang) => lang.code === selected);
      if (!language) return; // TODO: handle not found

      updateSettings((settings) => ({
        ...settings,
        defaultTargetLanguage: language,
      }));
    },
    [languages, updateSettings],
  );

  return (
    <Select
      className="w-40"
      value={defaultTargetLanguage.code}
      onChange={onChange}
      {...props}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}
