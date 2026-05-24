import { motion } from "motion/react";
import { useEffect, useState } from "react";
import "./App.css";
import { AnimatePresence } from "motion/react";
import { SettingsView } from "./features/settings/SettingsView";
import { TranslationView } from "./features/translation/TranslationView";
import { useTranslationModelStore } from "./shared/stores/translationModelStore";
import { listModels } from "./shared/tauri/translation";

function App() {
  const [settings, setSettings] = useState(false);
  const { setAvailableModels } = useTranslationModelStore();

  useEffect(() => {
    (async () => {
      setAvailableModels(await listModels());
    })();
  }, [setAvailableModels]);

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
