import type { AppLocaleSettingDto } from "../../rust-bindings/AppLocaleSettingDto";

export const SUPPORTED_APP_LOCALES = ["ja", "en", "zh-CN"] as const;

export type SupportedAppLocale = (typeof SUPPORTED_APP_LOCALES)[number];

export function isSupportedAppLocale(
  locale: string,
): locale is SupportedAppLocale {
  return SUPPORTED_APP_LOCALES.includes(locale as SupportedAppLocale);
}

function normalizeCandidate(locale: string): SupportedAppLocale | null {
  if (locale === "zh-CN" || locale === "zh-Hans" || locale === "zh-Hans-CN")
    return "zh-CN";

  const language = locale.split("-")[0];
  if (language === "ja") return "ja";
  if (language === "en") return "en";
  if (language === "zh") return "zh-CN";

  return null;
}

export function resolveAppLocale(
  setting: AppLocaleSettingDto,
  candidates: readonly string[] = navigator.languages,
): SupportedAppLocale {
  if (setting !== "system") return setting;

  for (const candidate of candidates) {
    const normalized = normalizeCandidate(candidate);
    if (normalized !== null) return normalized;
  }

  return "ja";
}
