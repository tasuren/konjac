import { getCurrentWindow } from "@tauri-apps/api/window";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";

export type UseWindowDraggingOptions = { includesChildren: boolean };

/**
 * Tauri's `data-tauri-drag-region` works well, but
 * clicking the drag region does not remove focus from select elements.
 */
export function useWindowDragging(
  ref: RefObject<HTMLElement | null>,
  opts?: UseWindowDraggingOptions,
): string {
  const tauriWindow = useMemo(() => getCurrentWindow(), []);
  const dragStarting = useRef(false);
  const [className, setClassName] = useState("");

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const isInteractiveElement = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;

      return (
        target.closest(
          "button, input, select, textarea, a, [contenteditable='true']",
        ) !== null
      );
    };

    const isTargetElement = (event: MouseEvent) =>
      (opts?.includesChildren &&
        element.contains(event.target as Node) &&
        !isInteractiveElement(event.target)) ||
      event.target === ref.current;

    const onMouseDownOrUp = (event: MouseEvent) => {
      if (!isTargetElement(event)) return;

      const dragging = event.buttons === 1;
      dragStarting.current = dragging;
      if (!dragging) setClassName("");
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isTargetElement(event)) return;

      if (dragStarting.current && event.buttons === 1) {
        setClassName("cursor-default select-none");
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
  }, [ref, tauriWindow, opts?.includesChildren]);

  return className;
}
