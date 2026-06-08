import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LanguageInfoDto } from "../../rust-bindings/LanguageInfoDto";
import { isSupportedAppLocale, type SupportedAppLocale } from "./locales";

type IntlListFormat = new (
  locales?: string | string[],
  options?: { style?: "long" | "short" | "narrow"; type?: "conjunction" },
) => { format: (values: string[]) => string };

function normalizeLocale(locale?: string): SupportedAppLocale {
  if (locale !== undefined && isSupportedAppLocale(locale)) return locale;

  return "ja";
}

export function localizedLanguageName(
  language: LanguageInfoDto,
  locale: string,
): string {
  const displayNames = new Intl.DisplayNames([locale], { type: "language" });
  return displayNames.of(language.code) ?? language.name ?? language.code;
}

export function sortLocalizedLanguages(
  languages: LanguageInfoDto[],
  locale: string,
): LanguageInfoDto[] {
  const collator = new Intl.Collator(locale);

  return [...languages].sort((a, b) =>
    collator.compare(
      localizedLanguageName(a, locale),
      localizedLanguageName(b, locale),
    ),
  );
}

export function localizedLanguageList(
  languages: LanguageInfoDto[],
  locale: string,
): string {
  const ListFormat = (Intl as typeof Intl & { ListFormat: IntlListFormat })
    .ListFormat;
  const listFormat = new ListFormat(locale, {
    style: "long",
    type: "conjunction",
  });

  return listFormat.format(
    languages.map((language) => localizedLanguageName(language, locale)),
  );
}

export function useLanguageDisplay() {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);

  return useMemo(
    () => ({
      locale,
      name: (language: LanguageInfoDto) =>
        localizedLanguageName(language, locale),
      sort: (languages: LanguageInfoDto[]) =>
        sortLocalizedLanguages(languages, locale),
      list: (languages: LanguageInfoDto[]) =>
        localizedLanguageList(languages, locale),
    }),
    [locale],
  );
}
