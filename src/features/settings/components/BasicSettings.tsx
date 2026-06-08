import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { AppLocaleSettingDto } from "../../../rust-bindings/AppLocaleSettingDto";
import type { SettingsDto } from "../../../rust-bindings/SettingsDto";
import type { ThemeSettingDto } from "../../../rust-bindings/ThemeSettingDto";
import { Select } from "../../../shared/components/Select";
import { useSettingsStore } from "../../../shared/stores/settingsStore";

export function ThemeSelect({ name, id }: { name: string; id: string }) {
  const { theme, updateSettings } = useSettingsStore();
  const { t } = useTranslation();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      if (selected !== "light" && selected !== "dark" && selected !== "system")
        throw new Error("Invalid theme was set on options");

      updateSettings((settings: SettingsDto) => ({
        ...settings,
        theme: selected as ThemeSettingDto,
      }));
    },
    [updateSettings],
  );

  return (
    <Select name={name} id={id} value={theme} onChange={onChange}>
      <option value="dark">{t("settings.themeOptions.dark")}</option>
      <option value="light">{t("settings.themeOptions.light")}</option>
      <option value="system">{t("settings.themeOptions.system")}</option>
    </Select>
  );
}

export function AppLocaleSelect({ name, id }: { name: string; id: string }) {
  const { appLocale, updateSettings } = useSettingsStore();
  const { t } = useTranslation();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      if (
        selected !== "system" &&
        selected !== "ja" &&
        selected !== "en" &&
        selected !== "zh-CN"
      )
        throw new Error("Invalid app locale was set on options");

      updateSettings((settings: SettingsDto) => ({
        ...settings,
        appLocale: selected as AppLocaleSettingDto,
      }));
    },
    [updateSettings],
  );

  return (
    <Select name={name} id={id} value={appLocale} onChange={onChange}>
      <option value="system">{t("settings.localeOptions.system")}</option>
      <option value="ja">{t("settings.localeOptions.ja")}</option>
      <option value="en">{t("settings.localeOptions.en")}</option>
      <option value="zh-CN">{t("settings.localeOptions.zhCN")}</option>
    </Select>
  );
}
