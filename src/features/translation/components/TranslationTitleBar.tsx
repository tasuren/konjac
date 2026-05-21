import { cn } from "@sglara/cn";
import { Settings } from "lucide-react";
import { useRef } from "react";
import { useWindowDragging } from "../../../shared/hooks/useWindowDragging";

export function TranslationTitleBar() {
  const titleBarRef = useRef(null);
  const titleBarClassName = useWindowDragging(titleBarRef, {
    includesChildren: true,
  });

  return (
    <div
      className={cn("h-full flex items-center", titleBarClassName)}
      ref={titleBarRef}
    >
      <div className="cursor-default select-none">Konjac / コンニャク</div>

      <div className="ml-auto px-2.5 flex items-center">
        <button type="button" className="active:opacity-70">
          <Settings size={23} className="text-text" />
        </button>
      </div>
    </div>
  );
}
