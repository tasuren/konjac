import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeI18n } from "./shared/i18n";
import { initialSettings } from "./shared/stores/settingsStore";
import { platform } from "@tauri-apps/plugin-os";

await initializeI18n(initialSettings.appLocale);
document.documentElement.classList.add(`os-${platform()}`);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
