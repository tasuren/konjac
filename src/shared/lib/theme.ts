import { getCurrentWindow, type Theme } from "@tauri-apps/api/window";
import type { ThemeDto } from "../../rust-bindings/ThemeDto";

const window = getCurrentWindow();

export const applyTheme = (theme: Theme) => {
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};

export const resolveTheme = async (theme: ThemeDto) =>
  theme === "system" ? (await window.theme()) || "light" : theme;
