import { X } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import type { ModelDto } from "../../rust-bindings/ModelDto";
import type { ModelSelectionDto } from "../../rust-bindings/ModelSelectionDto";
import type { SettingsDto } from "../../rust-bindings/SettingsDto";
import type { ThemeSettingDto } from "../../rust-bindings/ThemeSettingDto";
import { Select, type SelectProps } from "../../shared/components/Select";
import { TitleBar } from "../../shared/components/TitleBar";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import { listAvailableModels } from "../../shared/tauri/translation";

export function SettingsView({
  setSettings,
}: {
  setSettings: (settings: boolean) => void;
}) {
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

        <div>
          <label htmlFor="theme-select">テーマ</label>
          <ThemeSelect name="theme" id="theme-select" />
        </div>

        <h1 className="text-2xl mt-10 mb-4">翻訳設定</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="model-select">翻訳で使用するモデル</label>
          <ModelSelect name="model" id="model-select" />
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
