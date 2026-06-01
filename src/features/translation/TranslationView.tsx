import { cn } from "@sglara/cn";
import { Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { TitleBar } from "../../shared/components/TitleBar";
import { useWindowDragging } from "../../shared/hooks/useWindowDragging";
import { useSettingsStore } from "../../shared/stores/settingsStore";
import { TranslationControls } from "./components/TranslationControls";
import { TranslationInput } from "./components/TranslationInput";
import { TranslationOutput } from "./components/TranslationOutput";
import { useTranslationSession } from "./hooks/useTranslationEvent";
import { useTranslationSelectionStore } from "./stores/translationLanguageStore";

export function TranslationView({
  setSettings,
}: {
  setSettings: (settings: boolean) => void;
}) {
  const mainRef = useRef(null);
  const winDragClassName = useWindowDragging(mainRef);

  return (
    <div className="h-screen flex flex-col">
      <TitleBar>
        <div className="h-full flex items-center">
          <div>Konjac / コンニャク</div>

          <div className="ml-auto px-2.5 flex items-center">
            <button
              type="button"
              className="active:opacity-70"
              onClick={() => setSettings(true)}
            >
              <Settings size={23} className="text-text" />
            </button>
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

  useEffect(() => {
    if (input.length === 0) {
      setResolvedSourceLanguage(null);
    }
  }, [input, setResolvedSourceLanguage]);

  return (
    <div className="grow flex min-h-0 gap-6">
      <TranslationInput
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
