import { cn } from "@sglara/cn";
import { platform } from "@tauri-apps/plugin-os";
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
        "w-full h-11 bg-titlebar border border-border px-2.5",
        titleBarClassName,
        platform() === "macos" && "pl-20.5",
      )}
      ref={titleBarRef}
    >
      {children}
    </header>
  );
}
