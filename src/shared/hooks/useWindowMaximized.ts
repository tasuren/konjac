import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useWindowMaximized() {
  const tauriWindow = useMemo(() => getCurrentWindow(), []);
  const mounted = useRef(false);
  const [maximized, setMaximized] = useState(false);

  const refreshMaximized = useCallback(async () => {
    const nextMaximized = await tauriWindow.isMaximized();
    if (mounted.current) setMaximized(nextMaximized);
  }, [tauriWindow]);

  useEffect(() => {
    mounted.current = true;

    const unlisteners: UnlistenFn[] = [];
    let disposed = false;

    const listen = (promise: Promise<UnlistenFn>) => {
      promise
        .then((unlisten) => {
          if (disposed) {
            unlisten();
            return;
          }

          unlisteners.push(unlisten);
        })
        .catch((error: unknown) => {
          console.error("Failed to listen for window state changes", error);
        });
    };

    refreshMaximized();
    listen(tauriWindow.onResized(refreshMaximized));
    listen(tauriWindow.onMoved(refreshMaximized));
    listen(tauriWindow.onFocusChanged(refreshMaximized));

    return () => {
      mounted.current = false;
      disposed = true;
      for (const unlisten of unlisteners) unlisten();
    };
  }, [tauriWindow, refreshMaximized]);

  return { maximized, refreshMaximized };
}
