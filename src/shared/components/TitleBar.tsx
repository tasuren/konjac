import { cn } from "@sglara/cn";
import { type ReactNode, useRef } from "react";
import { useWindowDragging } from "../hooks/useWindowDragging";

export function TitleBar({ children }: { children: ReactNode }) {
  const titleBarRef = useRef(null);
  const titleBarClassName = useWindowDragging(titleBarRef, {
    includesChildren: true,
    maximizable: true,
  });

  return (
    <header
      className={cn(
        "w-full h-11 pl-20.5 bg-titlebar border border-border",
        titleBarClassName,
      )}
      ref={titleBarRef}
    >
      {children}
    </header>
  );
}
