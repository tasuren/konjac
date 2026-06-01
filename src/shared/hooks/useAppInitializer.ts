import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import { applyTheme, resolveTheme } from "../lib/theme";
import { useSettingsStore } from "../stores/settingsStore";

const tauriWindow = getCurrentWindow();

export function useAppInitializer() {
  const { theme } = useSettingsStore();

  // Set up OS theme change listener
  useEffect(() => {
    (async () => {
      applyTheme(await resolveTheme(theme));
    })();

    let unlisten = () => {};

    const setUpThemeChangeListener = async () => {
      unlisten = await tauriWindow.onThemeChanged(async (event) => {
        if (theme === "system") applyTheme(await resolveTheme(event.payload));
      });
    };

    void setUpThemeChangeListener();
    return unlisten;
  }, [theme]);
}
