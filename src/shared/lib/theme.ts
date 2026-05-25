import { getCurrentWindow, type Theme } from "@tauri-apps/api/window";
import type { ThemeSettingDto } from "../../rust-bindings/ThemeSettingDto";
import { getSettings } from "../tauri/settings";

const tauriWindow = getCurrentWindow();

export const applyTheme = (theme: Theme) => {
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};

export const resolveTheme = async (theme: ThemeSettingDto) =>
  theme === "system" ? (await tauriWindow.theme()) || "light" : theme;

const settings = await getSettings();
applyTheme(await resolveTheme(settings.theme));
