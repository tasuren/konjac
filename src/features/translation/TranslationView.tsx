import { cn } from "@sglara/cn";
import { useRef } from "react";
import { useWindowDragging } from "../../shared/hooks/useWindowDragging";
import TranslationControls from "./components/TranslationControls";
import TranslationPane from "./components/TranslationPane";
import { TranslationTitleBar } from "./components/TranslationTitleBar";

export function TranslationView() {
  const mainRef = useRef(null);
  const winDragClassName = useWindowDragging(mainRef);

  return (
    <div>
      <header>
        <TranslationTitleBar />
      </header>

      <main
        className={cn(
          "w-screen h-screen p-6 flex flex-col gap-6",
          winDragClassName,
        )}
        ref={mainRef}
      >
        <TranslationControls />
        <TranslationPane />
      </main>
    </div>
  );
}
