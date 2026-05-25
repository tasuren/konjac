import { invoke } from "@tauri-apps/api/core";
import type { SettingsDto } from "../../rust-bindings/SettingsDto";

export async function getSettings(): Promise<SettingsDto> {
  return await invoke("get_settings");
}

export async function setSettings(settings: SettingsDto): Promise<void> {
  await invoke("save_settings", { settings });
}
