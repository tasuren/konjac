import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { SettingsView } from "./features/settings/SettingsView";
import { TranslationView } from "./features/translation/TranslationView";
import "./App.css";
import { useAppInitializer } from "./shared/hooks/useAppInitializer";

function App() {
  useAppInitializer();

  const [settings, setSettings] = useState(false);
  const [focus, setFocus] = useState<"model-select" | undefined>(undefined);

  const focusModelSelect = useCallback(() => {
    setSettings(true);
    setFocus("model-select");
  }, []);

  useEffect(() => {
    if (!settings) setFocus(undefined);
  }, [settings]);

  return (
    <>
      <TranslationView
        setSettings={setSettings}
        focusModelSelect={focusModelSelect}
      />

      <AnimatePresence>
        {settings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SettingsView setSettings={setSettings} focus={focus} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
