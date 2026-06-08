import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { AppLocaleSettingDto } from "../../rust-bindings/AppLocaleSettingDto";
import { resolveAppLocale } from "./locales";
import { en } from "./resources/en";
import { ja } from "./resources/ja";
import { zhCN } from "./resources/zhCN";

export async function initializeI18n(appLocale: AppLocaleSettingDto) {
  const language = resolveAppLocale(appLocale);

  await i18n.use(initReactI18next).init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
      "zh-CN": { translation: zhCN },
    },
    lng: language,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

  document.documentElement.lang = language;
}

export { i18n };
