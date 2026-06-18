import { useCallback, useEffect, useRef, useState } from "react";
import { TitleBar } from "../../shared/components/TitleBar";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import { listenQuickCopyTranslationInput } from "../../shared/tauri/quickCopyTranslate";
import { TranslationControls } from "./components/TranslationControls";
import {
  type ClipboardInputMode,
  type ClipboardInputVariants,
  TranslationInput,
} from "./components/TranslationInput";
import { TranslationOutput } from "./components/TranslationOutput";
import { useTranslationSession } from "./hooks/useTranslationSession";
import { useTranslationSelectionStore } from "./stores/translationLanguageStore";

export function TranslationView({
  setSettings,
  focusModelSelect,
}: {
  setSettings: (settings: boolean) => void;
  focusModelSelect: () => void;
}) {
  const mainRef = useRef(null);

  return (
    <div className="h-screen flex flex-col">
      <TitleBar settingsOpened={false} setSettings={setSettings} />

      <main className="grow min-h-0 p-6 flex flex-col gap-6" ref={mainRef}>
        <TranslationPane focusModelSelect={focusModelSelect} />
      </main>
    </div>
  );
}

function TranslationPane({
  focusModelSelect,
}: {
  focusModelSelect: () => void;
}) {
  const {
    sourceLanguage,
    resolvedSourceLanguage,
    setSourceLanguage,
    setResolvedSourceLanguage,
    targetLanguage,
    setTargetLanguage,
  } = useTranslationSelectionStore();
  const { model, quickCopyTranslate } = useSettingsStore();
  const [clipboardInputMode, setClipboardInputMode] =
    useState<ClipboardInputMode>("markdown");
  const [clipboardInputVariants, setClipboardInputVariantsState] =
    useState<ClipboardInputVariants | null>(null);

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

  const applyClipboardInputVariants = useCallback(
    (variants: ClipboardInputVariants) => {
      setClipboardInputVariantsState(variants);
      setInput(
        clipboardInputMode === "markdown"
          ? variants.markdownInput
          : variants.rawInput,
      );
    },
    [clipboardInputMode, setInput],
  );

  const handleClipboardInputModeChange = useCallback(
    (mode: ClipboardInputMode) => {
      setClipboardInputMode(mode);

      if (
        clipboardInputVariants === null ||
        (input !== clipboardInputVariants.rawInput &&
          input !== clipboardInputVariants.markdownInput)
      ) {
        return;
      }

      setInput(
        mode === "markdown"
          ? clipboardInputVariants.markdownInput
          : clipboardInputVariants.rawInput,
      );
    },
    [clipboardInputVariants, input, setInput],
  );

  useEffect(() => {
    if (input.length === 0) {
      setResolvedSourceLanguage(null);
    }
  }, [input, setResolvedSourceLanguage]);

  useEffect(() => {
    if (
      clipboardInputVariants !== null &&
      input !== clipboardInputVariants.rawInput &&
      input !== clipboardInputVariants.markdownInput
    ) {
      setClipboardInputVariantsState(null);
    }
  }, [clipboardInputVariants, input]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let disposed = false;

    listenQuickCopyTranslationInput(({ rawText, markdownText }) => {
      const variants = {
        rawInput: rawText,
        markdownInput: markdownText ?? rawText,
      };

      applyClipboardInputVariants(variants);
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
  }, [applyClipboardInputVariants]);

  return (
    <div className="grow min-h-0 grid grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-6 md:grid-cols-2 md:grid-rows-[auto_minmax(0,1fr)]">
      <div className="min-w-0 md:col-span-2">
        <TranslationControls
          swapDisabled={swapDisabled}
          onSwap={handleSwap}
          focusModelSelect={focusModelSelect}
        />
      </div>

      <TranslationInput
        input={input}
        setInput={setInput}
        clipboardInputMode={clipboardInputMode}
        setClipboardInputMode={handleClipboardInputModeChange}
        applyClipboardInputVariants={applyClipboardInputVariants}
        quickCopyTranslateEnabled={quickCopyTranslate.enabled}
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
  );
}
