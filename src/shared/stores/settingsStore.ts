import { debounce } from "es-toolkit";
import { create } from "zustand";
import type { SettingsDto } from "../../rust-bindings/SettingsDto";
import { getSettings, setSettings as saveSettings } from "../tauri/settings";

const debouncedSave = debounce(
  async (settings: SettingsDto) =>
    await saveSettings(settings).catch((e) =>
      console.error("Failed to save settings:", e),
    ),
  300,
);

export type SettingsStore = SettingsDto & {
  updateSettings: (updater: (settings: SettingsDto) => SettingsDto) => void;
};

const initialSettings = await getSettings();

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialSettings,
  updateSettings: (updater) => {
    const settings = updater(get());
    debouncedSave(settings);
    set(settings);
  },
}));
