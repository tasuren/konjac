import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

export function useIsFullscreen(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const tauriWindow = getCurrentWindow();
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    const updateIsFullscreen = () => {
      tauriWindow.isFullscreen().then((value) => {
        if (!cancelled) setIsFullscreen(value);
      });
    };

    updateIsFullscreen();

    tauriWindow.onResized(updateIsFullscreen).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlisten = fn;
      }
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return isFullscreen;
}
