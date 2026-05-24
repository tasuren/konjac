import { cn } from "@sglara/cn";
import { Settings } from "lucide-react";
import { useRef } from "react";
import { TitleBar } from "../../shared/components/TitleBar";
import { useWindowDragging } from "../../shared/hooks/useWindowDragging";
import TranslationControls from "./components/TranslationControls";
import TranslationPane from "./components/TranslationPane";

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
