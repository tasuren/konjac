import { useTranslationSession } from "../hooks/useTranslationEvent";
import { useTranslationSelectionStore } from "../stores/translationSelectionStore";

export default function TranslationPane() {
  const { sourceLanguage, resolvedSourceLanguage, targetLanguage, model } =
    useTranslationSelectionStore();

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
      <div className="p-4 w-1/2 border border-border bg-surface rounded-xl">
        {model === null ? (
          <p>
            現在、翻訳を処理するAIモデルが設定されていません。設定後、翻訳が可能となります。
          </p>
        ) : (
          output || (
            <p className="text-text/60">翻訳結果はこちらに表示されます。</p>
          )
        )}
      </div>
    </div>
  );
}
