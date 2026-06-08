import { confirm } from "@tauri-apps/plugin-dialog";
import { debounce } from "es-toolkit";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import type { ModelDto } from "../../../rust-bindings/ModelDto";
import type { ModelSelectionDto } from "../../../rust-bindings/ModelSelectionDto";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Select } from "../../../shared/components/Select";
import { TextArea } from "../../../shared/components/TextArea";
import { useSettingsStore } from "../../../shared/stores/settingsStore";
import { DEFAULT_TRANSLATION_PROMPT } from "../../../shared/tauri/settings";
import { listAvailableModels } from "../../../shared/tauri/translation";
import { SettingsDescription } from "./SettingsDescription";

function genModelKey(model: ModelSelectionDto) {
  return `${model.provider}-${model.id}`;
}

export function ModelSelect({ name, id }: { name: string; id: string }) {
  const [models, setModels] = useState<Map<string, ModelDto>>(new Map());
  const { model, updateSettings } = useSettingsStore();
  const { t } = useTranslation();

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
      <Select name={name} id={id}>
        <option disabled={true}>{t("llm.noModels")}</option>
      </Select>
    );

  return (
    <Select value={genModelKey(model)} onChange={onChange} name={name} id={id}>
      {Array.from(models).map(([key, model]) => (
        <option key={key} value={key}>
          {model.displayName ?? model.id}
        </option>
      ))}
    </Select>
  );
}

export function SystemPromptTextArea({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { systemPrompt, updateSettings } = useSettingsStore();
  const [composition, setComposition] = useState(false);

  const debouncedOnChange = useMemo(
    () =>
      debounce((value: string) => {
        if (composition) return;

        updateSettings((settings) => ({
          ...settings,
          systemPrompt: value,
        }));
      }, 500),
    [updateSettings, composition],
  );

  return (
    <TextArea
      name={name}
      id={id}
      defaultValue={systemPrompt ?? ""}
      onChange={(event) => debouncedOnChange(event.currentTarget.value)}
      onCompositionStart={() => setComposition(true)}
      onCompositionEnd={(event) => {
        setComposition(false);
        updateSettings((settings) => ({
          ...settings,
          systemPrompt: event.currentTarget.value,
        }));
      }}
    />
  );
}

export function TranslationPromptTextArea({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { translationPrompt, updateSettings } = useSettingsStore();
  const [composition, setComposition] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  const debouncedChange = useMemo(
    () =>
      debounce((value: string) => {
        if (composition) return;

        updateSettings((settings) => ({
          ...settings,
          translationPrompt: value,
        }));
      }, 500),
    [updateSettings, composition],
  );

  const onReset = useCallback(async () => {
    const textarea = textareaRef.current;
    if (textarea === null || !(await confirm(t("llm.resetPromptConfirm"))))
      return;

    textarea.value = DEFAULT_TRANSLATION_PROMPT;
    updateSettings((settings) => ({
      ...settings,
      translationPrompt: textarea.value,
    }));
  }, [t, updateSettings]);

  return (
    <>
      <SettingsDescription className="space-y-2">
        <p>{t("llm.promptVariablesIntro")}</p>

        <ul className="list-disc pl-6 [&>*>code]:select-auto [&>*>code]:cursor-auto">
          <li>
            <code>{"{source_lang}"}</code> ... {t("llm.variables.sourceLang")}
          </li>
          <li>
            <code>{"{source_code}"}</code> ... {t("llm.variables.sourceCode")}
          </li>
          <li>
            <code>{"{target_lang}"}</code> ... {t("llm.variables.targetLang")}
          </li>
          <li>
            <code>{"{target_code}"}</code> ... {t("llm.variables.targetCode")}
          </li>
          <li>
            <code>{"{text}"}</code> ... {t("llm.variables.text")}
          </li>
        </ul>
      </SettingsDescription>

      <TextArea
        name={name}
        id={id}
        defaultValue={translationPrompt}
        onChange={(event) => debouncedChange(event.currentTarget.value)}
        onCompositionStart={() => setComposition(true)}
        onCompositionEnd={(event) => {
          setComposition(false);
          updateSettings((settings) => ({
            ...settings,
            translationPrompt: event.currentTarget.value,
          }));
        }}
        ref={textareaRef}
      />

      <Button className="px-2 py-0.5 text-sm" onClick={onReset}>
        {t("llm.resetPrompt")}
      </Button>
    </>
  );
}

export function OllamaBaseUrl({ name, id }: { name: string; id: string }) {
  const { providers, updateSettings } = useSettingsStore();

  const writeBaseUrl = useMemo(
    () =>
      debounce((value: string) => {
        updateSettings((settings) => ({
          ...settings,
          providers: {
            ...settings.providers,
            ollama: {
              ...settings.providers.ollama,
              baseUrl: value,
            },
          },
        }));
      }, 500),
    [updateSettings],
  );

  return (
    <Input
      type="url"
      name={name}
      id={id}
      defaultValue={providers.ollama.baseUrl}
      onChange={(event) => writeBaseUrl(event.currentTarget.value)}
    />
  );
}

export function OllamaKeepAlive({ name, id }: { name: string; id: string }) {
  const { providers, updateSettings } = useSettingsStore();

  const writeKeepAlive = useMemo(
    () =>
      debounce((value: string | null) => {
        if (value !== null && value.length === 0) value = null;

        updateSettings((settings) => ({
          ...settings,
          providers: {
            ...settings.providers,
            ollama: {
              ...settings.providers.ollama,
              keepAlive: value,
            },
          },
        }));
      }, 500),
    [updateSettings],
  );

  return (
    <Input
      type="text"
      name={name}
      id={id}
      defaultValue={providers.ollama.keepAlive || ""}
      onChange={(event) => writeKeepAlive(event.currentTarget.value)}
    />
  );
}
