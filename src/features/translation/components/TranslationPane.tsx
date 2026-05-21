import { useTranslationSession } from "../hooks/useTranslationEvent";
import { useTranslationSelectionStore } from "../stores/translationSelectionStore";
import { TranslationResultBox } from "./TranslationResultBox";

export default function TranslationPane() {
  const { sourceLanguage, resolvedSourceLanguage, targetLanguage, model } =
    useTranslationSelectionStore();

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
  });

  return (
    <div className="grow flex gap-6">
      <textarea
        placeholder="翻訳したいテキストを入力"
        className="p-4 w-1/2 border border-border rounded-xl"
        onChange={(event) => setInput(event.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={(event) => {
          handleCompositionEnd();
          setInput(event.currentTarget.value);
        }}
      ></textarea>

      <TranslationResultBox
        model={model}
        input={input}
        output={output}
        status={status}
      />
    </div>
  );
}
