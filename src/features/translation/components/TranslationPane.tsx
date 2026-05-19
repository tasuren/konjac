import { useEffect, useState } from "react";
import { useTranslationSession } from "../hooks/useTranslationEvent";
import { useTranslationSelectionStore } from "../stores/translationSelectionStore";

export default function TranslationPane() {
  const { sourceLanguage, resolvedSourceLanguage, targetLanguage, model } =
    useTranslationSelectionStore();

  if (model === null) throw new Error(); // TODO: 今後モデル選択画面を実装する。

  const {
    output,
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

  const [result, setResult] = useState("");

  useEffect(() => {
    setResult(output);
  }, [output]);

  return (
    <div className="grow flex gap-6">
      <textarea
        placeholder="翻訳前"
        className="grow p-4 border border-border rounded-xl"
        onChange={(event) => setInput(event.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={(event) => {
          handleCompositionEnd();
          setInput(event.currentTarget.value);
        }}
      ></textarea>
      <textarea
        value={result}
        onChange={(event) => setResult(event.target.value)}
        disabled={status === "translating"}
        aria-disabled={status === "translating"}
        className="grow p-4 border border-border rounded-xl"
      ></textarea>
    </div>
  );
}
