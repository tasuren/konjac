import { invoke } from "@tauri-apps/api/core";
import type { DetectableLanguageDto } from "../../rust-bindings/DetectableLanguageDto";
import type { LanguageCodeDto } from "../../rust-bindings/LanguageCodeDto";
import type { LanguageDetectionScopeSettingDto } from "../../rust-bindings/LanguageDetectionScopeSettingDto";
import type { LanguageInfoDto } from "../../rust-bindings/LanguageInfoDto";
import type { LanguageListScopeSettingDto } from "../../rust-bindings/LanguageListScopeSettingDto";

export async function listLanguages(): Promise<LanguageInfoDto[]> {
  return await invoke("list_languages");
}

export async function listCommonLanguages(): Promise<LanguageInfoDto[]> {
  return await invoke("list_common_languages");
}

export const LANGUAGES = await listLanguages();
LANGUAGES.sort((a, b) => a.name.localeCompare(b.name));
export const COMMON_LANGUAGES = await listCommonLanguages();
COMMON_LANGUAGES.sort((a, b) => a.name.localeCompare(b.name));

export function getLanguage(code: string): LanguageInfoDto | undefined {
  return LANGUAGES.find((lang) => lang.code === code);
}

export function filterWithScope(
  scope: LanguageListScopeSettingDto,
  customLanguages?: LanguageCodeDto[],
): LanguageInfoDto[] {
  switch (scope) {
    case "all":
      return LANGUAGES;
    case "common":
      return COMMON_LANGUAGES;
    case "custom":
      return LANGUAGES.filter(
        (lang) =>
          customLanguages === undefined || customLanguages.includes(lang.code),
      );
    default:
      console.warn(`Unknown scope: ${scope}`);
      return LANGUAGES;
  }
}

export function filterWithDetectable(
  scope: LanguageDetectionScopeSettingDto,
  detectableLanguages?: LanguageCodeDto[],
): LanguageInfoDto[] {
  switch (scope) {
    case "all":
      return LANGUAGES;
    case "common":
      return COMMON_LANGUAGES;
    case "custom":
      return LANGUAGES.filter(
        (lang) =>
          detectableLanguages === undefined ||
          detectableLanguages.includes(lang.code as DetectableLanguageDto),
      );
    default:
      console.warn(`Unknown scope: ${scope}`);
      return LANGUAGES;
  }
}
