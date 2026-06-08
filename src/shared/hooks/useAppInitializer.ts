import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import { i18n } from "../i18n";
import { resolveAppLocale } from "../i18n/locales";
import { applyTheme, resolveTheme } from "../lib/theme";
import { useSettingsStore } from "../stores/settingsStore";

const tauriWindow = getCurrentWindow();

export function useAppInitializer() {
  const { theme, appLocale } = useSettingsStore();

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

  useEffect(() => {
    const locale = resolveAppLocale(appLocale);

    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [appLocale]);
}
