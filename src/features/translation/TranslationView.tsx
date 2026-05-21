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
    <div className="h-screen flex flex-col">
      <header className="w-full h-11 pl-20.5 bg-titlebar border border-border">
        <TranslationTitleBar />
      </header>

      <main
        className={cn("grow p-6 flex flex-col gap-6", winDragClassName)}
        ref={mainRef}
      >
        <TranslationControls />
        <TranslationPane />
      </main>
    </div>
  );
}
