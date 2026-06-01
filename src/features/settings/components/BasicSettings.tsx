import type { ChangeEvent } from "react";
import { useCallback } from "react";
import type { SettingsDto } from "../../../rust-bindings/SettingsDto";
import type { ThemeSettingDto } from "../../../rust-bindings/ThemeSettingDto";
import { Select } from "../../../shared/components/Select";
import { useSettingsStore } from "../../../shared/stores/settingsStore";

export function ThemeSelect({ name, id }: { name: string; id: string }) {
  const { theme, updateSettings } = useSettingsStore();

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
      <option value="dark">ダーク</option>
      <option value="light">ライト</option>
      <option value="system">システムに合わせる</option>
    </Select>
  );
}
