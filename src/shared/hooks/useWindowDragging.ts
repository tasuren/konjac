import { getCurrentWindow } from "@tauri-apps/api/window";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

/**
 * Tauri's `data-tauri-drag-region` works well, but
 * clicking the drag region does not remove focus from select elements.
 */
export function useWindowDragging(ref: RefObject<HTMLElement | null>): string {
  const tauriWindow = useMemo(() => getCurrentWindow(), []);
  const dragStarting = useRef(false);
  const [className, setClassName] = useState("");

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const isTargetElement = (event: MouseEvent) => event.target === ref.current;

    const onMouseDownOrUp = (event: MouseEvent) => {
      if (!isTargetElement(event)) return;

      const dragging = event.buttons === 1;
      setClassName(dragging ? "cursor-default select-none" : "");
      dragStarting.current = dragging;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isTargetElement(event)) return;

      if (dragStarting.current && event.buttons === 1) {
        tauriWindow.startDragging();
        dragStarting.current = false;
      }
    };

    element.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDownOrUp);
    window.addEventListener("mouseup", onMouseDownOrUp);

    return () => {
      element.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDownOrUp);
      window.removeEventListener("mouseup", onMouseDownOrUp);
    };
  }, [ref, tauriWindow]);

  return className;
}
