import { platform } from "@tauri-apps/plugin-os";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeI18n } from "./shared/i18n";
import { initialSettings } from "./shared/stores/settingsStore";

await initializeI18n(initialSettings.appLocale);
document.documentElement.classList.add(`os-${platform()}`);

// Tauri's WebView shows a native context menu with a "Reload" item; hide it in production builds only.
// Inputs/textarea/contenteditable and text actually selected in a [data-allow-context-menu] region are
// exempted so copy/paste items on context menu still works there.
if (import.meta.env.PROD) {
  document.addEventListener("contextmenu", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable=true]")) return;

    const allowRegion = target.closest("[data-allow-context-menu]");
    const hasSelection = !!window.getSelection()?.toString();
    if (allowRegion && hasSelection) return;

    e.preventDefault();
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
