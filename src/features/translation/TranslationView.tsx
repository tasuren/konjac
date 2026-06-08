import { cn } from "@sglara/cn";
import { Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TitleBar } from "../../shared/components/TitleBar";
import { useWindowDragging } from "../../shared/hooks/useWindowDragging";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import { listenQuickCopyTranslationInput } from "../../shared/tauri/quickCopyTranslate";
import { TranslationControls } from "./components/TranslationControls";
import { TranslationInput } from "./components/TranslationInput";
import { TranslationOutput } from "./components/TranslationOutput";
import { useTranslationSession } from "./hooks/useTranslationEvent";
import { useTranslationSelectionStore } from "./stores/translationLanguageStore";
import { IconButton } from "../../shared/components/IconButton";

export function TranslationView({
  setSettings,
}: {
  setSettings: (settings: boolean) => void;
}) {
  const mainRef = useRef(null);
  const winDragClassName = useWindowDragging(mainRef);
  const { t } = useTranslation();

  return (
    <div className="h-screen flex flex-col">
      <TitleBar>
        <div className="h-full flex items-center">
          <div>{t("app.title")}</div>

          <div className="ml-auto flex items-center">
            <IconButton
              className="text-text hover:bg-transparent active:opacity-70"
              onClick={() => setSettings(true)}
              aria-label={t("settings.title")}
            >
              <Settings size={23} className="text-text" />
            </IconButton>
          </div>
        </div>
      </TitleBar>

      <main
        className={cn("grow min-h-0 p-6 flex flex-col gap-6", winDragClassName)}
        ref={mainRef}
      >
        <TranslationControls />
        <TranslationPane />
      </main>
    </div>
  );
}

function TranslationPane() {
  const {
    sourceLanguage,
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
    error,
    handleCompositionStart,
    handleCompositionEnd,
  } = useTranslationSession({
    sourceLanguage,
    targetLanguage,
    model,
    debounceMs: 600,
    setResolvedSourceLanguage,
    setTargetLanguage,
  });

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
        error={error}
      />
    </div>
  );
}
