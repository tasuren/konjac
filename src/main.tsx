import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeI18n } from "./shared/i18n";
import { initialSettings } from "./shared/stores/settingsStore";

await initializeI18n(initialSettings.appLocale);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
