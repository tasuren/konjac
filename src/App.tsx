import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SettingsView } from "./features/settings/SettingsView";
import { TranslationView } from "./features/translation/TranslationView";
import "./App.css";
import { useAppInitializer } from "./shared/hooks/useAppInitializer";

function App() {
  useAppInitializer();
  const [settings, setSettings] = useState(false);

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
