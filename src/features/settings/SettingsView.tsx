import { X } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect } from "react";
import { Select, type SelectProps } from "../../shared/components/Select";
import { TitleBar } from "../../shared/components/TitleBar";
import {
  genModelKey,
  useTranslationModelStore,
} from "../../shared/stores/translationModelStore";

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
        <h1 className="text-2xl mb-4">翻訳設定</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="model-select">翻訳で使用するモデル</label>
          <ModelSelect id="model-select" />
        </div>
      </main>
    </div>
  );
}

function ModelSelect(props: SelectProps) {
  const {
    model,
    availableModels: models,
    setModel,
  } = useTranslationModelStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = models.get(event.currentTarget.value);
      if (selected === undefined) return;
      setModel(selected);
    },
    [models, setModel],
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
