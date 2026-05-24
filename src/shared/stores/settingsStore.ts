import { create } from "zustand";
import type { ThemeDto } from "../../rust-bindings/ThemeDto";
import { getTheme } from "../tauri/settings";

export type SettingsStore = {
  theme: ThemeDto;
  setTheme: (theme: ThemeDto) => void;
};

const initialTheme = await getTheme();

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => set({ theme }),
}));
