import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SettingsView } from "./features/settings/SettingsView";
import { TranslationView } from "./features/translation/TranslationView";
import { applyTheme, resolveTheme } from "./shared/lib/theme";
import { useSettingsStore } from "./shared/stores/settingsStore";
import { useTranslationModelStore } from "./shared/stores/translationModelStore";
import { listAvailableModels } from "./shared/tauri/translation";

import "./App.css";
import { setTheme } from "./shared/tauri/settings";

function App() {
  const [settings, setSettings] = useState(false);
  const { setAvailableModels } = useTranslationModelStore();
  const { theme } = useSettingsStore();

  useEffect(() => {
    (async () => {
      setAvailableModels(await listAvailableModels());
    })();
  }, [setAvailableModels]);

  const window = useMemo(getCurrentWindow, []);
  const themeInitialized = useRef(false);
  useEffect(() => {
    let unlisten = () => {};

    (async () => {
      applyTheme(await resolveTheme(theme));

      if (themeInitialized.current) {
        setTheme(theme);
      } else {
        themeInitialized.current = true;
      }

      unlisten = await window.onThemeChanged(async (event) => {
        if (theme === "system") applyTheme(await resolveTheme(event.payload));
      });
    })();

    return unlisten;
  }, [theme, window.onThemeChanged]);

  return (
    <>
      <TranslationView setSettings={setSettings} />

      <AnimatePresence>
        {settings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SettingsView setSettings={setSettings} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
