import { invoke } from "@tauri-apps/api/core";
import type { ThemeDto } from "../../rust-bindings/ThemeDto";

export async function getTheme(): Promise<ThemeDto> {
  return await invoke("get_theme");
}

export async function setTheme(theme: ThemeDto): Promise<ThemeDto> {
  return await invoke("set_theme", { theme });
}
