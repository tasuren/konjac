import { useCallback, useEffect, useRef } from "react";
import { TitleBar } from "../../shared/components/TitleBar";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import { listenQuickCopyTranslationInput } from "../../shared/tauri/quickCopyTranslate";
import { TranslationControls } from "./components/TranslationControls";
import { TranslationInput } from "./components/TranslationInput";
import { TranslationOutput } from "./components/TranslationOutput";
import { useTranslationSession } from "./hooks/useTranslationSession";
import { useTranslationSelectionStore } from "./stores/translationLanguageStore";

export function TranslationView({
  setSettings,
}: {
  setSettings: (settings: boolean) => void;
}) {
  const mainRef = useRef(null);

  return (
    <div className="h-screen flex flex-col">
      <TitleBar settingsOpened={false} setSettings={setSettings} />

      <main className="grow min-h-0 p-6 flex flex-col gap-6" ref={mainRef}>
        <TranslationPane />
      </main>
    </div>
  );
}

function TranslationPane() {
  const {
    sourceLanguage,
    resolvedSourceLanguage,
    setSourceLanguage,
    setResolvedSourceLanguage,
    targetLanguage,
    setTargetLanguage,
  } = useTranslationSelectionStore();
  const { model } = useSettingsStore();

  const {
    output,
    input,
    setInput,
    status,
    availabilityError,
    translationError,
    handleCompositionStart,
    handleCompositionEnd,
    swapInputOutput,
  } = useTranslationSession({
    sourceLanguage,
    targetLanguage,
    model,
    debounceMs: 600,
    setResolvedSourceLanguage,
    setTargetLanguage,
  });

  const handleSwap = useCallback(() => {
    const sourceCode =
      sourceLanguage.type === "auto_detect"
        ? resolvedSourceLanguage?.code
        : sourceLanguage.code;

    if (sourceCode === undefined || output.length === 0 || status !== "idle") {
      return;
    }

    setSourceLanguage({ type: "manual", code: targetLanguage });
    setTargetLanguage(sourceCode);
    setResolvedSourceLanguage(null);
    swapInputOutput();
  }, [
    sourceLanguage,
    resolvedSourceLanguage,
    targetLanguage,
    output.length,
    status,
    setSourceLanguage,
    setTargetLanguage,
    setResolvedSourceLanguage,
    swapInputOutput,
  ]);

  const swapDisabled =
    output.length === 0 ||
    status !== "idle" ||
    (sourceLanguage.type === "auto_detect" && resolvedSourceLanguage === null);

  useEffect(() => {
    if (input.length === 0) {
      setResolvedSourceLanguage(null);
    }
  }, [input, setResolvedSourceLanguage]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let disposed = false;

    listenQuickCopyTranslationInput(({ text }) => {
      setInput(text);
    }).then((dispose) => {
      if (disposed) {
        dispose();
        return;
      }

      unlisten = dispose;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [setInput]);

  return (
    <>
      <TranslationControls swapDisabled={swapDisabled} onSwap={handleSwap} />

      <div className="grow flex min-h-0 gap-6">
        <TranslationInput
          input={input}
          setInput={setInput}
          handleCompositionStart={handleCompositionStart}
          handleCompositionEnd={handleCompositionEnd}
        />

        <TranslationOutput
          model={model}
          input={input}
          output={output}
          status={status}
          availabilityError={availabilityError}
          translationError={translationError}
        />
      </div>
    </>
  );
}
