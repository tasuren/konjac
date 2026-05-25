import { useSettingsStore } from "../../../shared/stores/settingsStore";
import { useTranslationSession } from "../hooks/useTranslationEvent";
import { useTranslationSelectionStore } from "../stores/translationLanguageStore";
import { TranslationInputBox } from "./TranslationInputBox";
import { TranslationResultBox } from "./TranslationResultBox";

export default function TranslationPane() {
  const { sourceLanguage, setResolvedSourceLanguage, targetLanguage } =
    useTranslationSelectionStore();
  const { model } = useSettingsStore();

  const {
    output,
    input,
    setInput,
    status,
    error,
    handleCompositionStart,
    handleCompositionEnd,
  } = useTranslationSession({
    sourceLanguage,
    targetLanguage,
    model,
    debounceMs: 600,
    setResolvedSourceLanguage,
  });

  return (
    <div className="grow flex min-h-0 gap-6">
      <TranslationInputBox
        setInput={setInput}
        handleCompositionStart={handleCompositionStart}
        handleCompositionEnd={handleCompositionEnd}
      />

      <TranslationResultBox
        model={model}
        input={input}
        output={output}
        status={status}
        error={error}
      />
    </div>
  );
}
