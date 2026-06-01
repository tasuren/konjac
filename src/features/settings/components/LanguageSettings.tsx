import { Trash2 } from "lucide-react";
import { type ChangeEvent, useCallback, useRef } from "react";
import type { DetectableLanguageDto } from "../../../rust-bindings/DetectableLanguageDto";
import type { LanguageCodeDto } from "../../../rust-bindings/LanguageCodeDto";
import type { LanguageDetectionScopeSettingDto } from "../../../rust-bindings/LanguageDetectionScopeSettingDto";
import type { LanguageInfoDto } from "../../../rust-bindings/LanguageInfoDto";
import type { LanguageListScopeSettingDto } from "../../../rust-bindings/LanguageListScopeSettingDto";
import { Button } from "../../../shared/components/Button";
import { IconButton } from "../../../shared/components/IconButton";
import { Select } from "../../../shared/components/Select";
import { useSettingsStore } from "../../../shared/stores/settingsStore";
import {
  COMMON_LANGUAGES,
  filterWithDetectable,
  getLanguage,
  LANGUAGES,
} from "../../../shared/tauri/language";
import { useLanguageCatalog } from "../../translation/hooks/useLanguageCatalog";
import { SettingsField } from "./SettingsField";

export function SourceLanguageSelect({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { defaultSourceLanguage, updateSettings } = useSettingsStore();
  const { languages } = useLanguageCatalog();

  const onSelectSrcLang = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;

      if (selected === "auto-detect") {
        updateSettings((settings) => ({
          ...settings,
          defaultSourceLanguage: { type: "auto_detect" },
        }));
        return;
      }

      updateSettings((settings) => ({
        ...settings,
        defaultSourceLanguage: { type: "manual", code: selected },
      }));
    },
    [updateSettings],
  );

  return (
    <Select
      name={name}
      id={id}
      className="w-40"
      value={
        defaultSourceLanguage.type === "auto_detect"
          ? "auto-detect"
          : defaultSourceLanguage.code
      }
      onChange={onSelectSrcLang}
    >
      <option value="auto-detect">自動検出</option>

      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

export function TargetLanguageSelect({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { defaultTargetLanguage, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = event.currentTarget.value;
      updateSettings((settings) => ({
        ...settings,
        defaultTargetLanguage: selected,
      }));
    },
    [updateSettings],
  );

  return (
    <Select
      name={name}
      id={id}
      className="w-40"
      value={defaultTargetLanguage}
      onChange={onChange}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}

export function LanguageListScopeSelect({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { languageListScope, customLanguageListScope, updateSettings } =
    useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      updateSettings((settings) => ({
        ...settings,
        languageListScope: event.currentTarget
          .value as LanguageListScopeSettingDto,
      }));
    },
    [updateSettings],
  );

  const setCustomLanguageList = useCallback(
    (languages: LanguageCodeDto[]) => {
      updateSettings((settings) => ({
        ...settings,
        customLanguageListScope: languages,
      }));
    },
    [updateSettings],
  );

  return (
    <>
      <Select
        name={name}
        id={id}
        className="w-40"
        onChange={onChange}
        value={languageListScope}
      >
        <option value="all">全ての言語</option>
        <option value="common">主要な言語</option>
        <option value="custom">選択した言語のみ</option>
      </Select>

      {languageListScope === "common" && <CommonLanguageNotice />}

      {languageListScope === "custom" && (
        <SettingsField
          htmlFor="custom-language-list-scope-select"
          label="表示する言語"
          labelClassName="text-sm"
        >
          <LanguageList
            catalog={LANGUAGES}
            languageList={customLanguageListScope}
            selectId="custom-language-list-scope-select"
            setLanguageList={setCustomLanguageList}
          />
        </SettingsField>
      )}
    </>
  );
}

export function LanguageDetectionScopeSelect({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { autoDetection, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      updateSettings((settings) => ({
        ...settings,
        autoDetection: {
          ...settings.autoDetection,
          scope: event.currentTarget.value as LanguageDetectionScopeSettingDto,
        },
      }));
    },
    [updateSettings],
  );

  const setDetectionLanguageList = useCallback(
    (languages: LanguageCodeDto[]) => {
      updateSettings((settings) => ({
        ...settings,
        autoDetection: {
          ...settings.autoDetection,
          customDetectionScope: languages as DetectableLanguageDto[],
        },
      }));
    },
    [updateSettings],
  );

  return (
    <>
      <Select
        name={name}
        id={id}
        className="w-40"
        onChange={onChange}
        value={autoDetection.scope}
      >
        <option value="all">全ての言語</option>
        <option value="common">主要な言語</option>
        <option value="custom">選択した言語のみ</option>
      </Select>

      {autoDetection.scope === "common" && <CommonLanguageNotice />}

      {autoDetection.scope === "custom" && (
        <SettingsField
          htmlFor="custom-detection-list-scope-select"
          label="表示する言語"
          labelClassName="text-sm"
        >
          <LanguageList
            catalog={filterWithDetectable("all")}
            languageList={autoDetection.customDetectionScope}
            selectId="custom-detection-list-scope-select"
            setLanguageList={setDetectionLanguageList}
          />
        </SettingsField>
      )}
    </>
  );
}

function CommonLanguageNotice() {
  return (
    <div className="text-sm text-muted">
      {COMMON_LANGUAGES.map((language) => language.name).join("、")}
    </div>
  );
}

function LanguageList({
  catalog,
  languageList,
  selectId,
  setLanguageList,
}: {
  catalog: LanguageInfoDto[];
  languageList: LanguageCodeDto[];
  selectId: string;
  setLanguageList: (languages: LanguageCodeDto[]) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const onRemoveLanguage = useCallback(
    (code: string) => {
      if (languageList.length === 1) return;

      setLanguageList(
        languageList.filter((languageCode) => languageCode !== code),
      );
    },
    [languageList, setLanguageList],
  );

  const onAddLanguage = useCallback(() => {
    const code = selectRef.current?.value;
    if (code === undefined) return;
    if (languageList.includes(code)) return;

    setLanguageList([...languageList, code]);
  }, [languageList, setLanguageList]);

  return (
    <div className="w-fit space-y-4 rounded-lg border border-border p-3.5">
      <ul className="space-y-2 pl-2">
        {languageList?.map((code) => {
          const language = getLanguage(code);
          const lastOne = languageList.length <= 1;

          return (
            language && (
              <li key={language.code} className="flex justify-between">
                {language.name}

                {!lastOne && (
                  <IconButton
                    disabled={lastOne}
                    title="削除"
                    aria-label="削除"
                    onClick={() => onRemoveLanguage(language.code)}
                  >
                    <Trash2 className="size-5" />
                  </IconButton>
                )}
              </li>
            )
          );
        })}
      </ul>

      <div className="flex w-fit gap-4">
        <Select
          id={selectId}
          className="w-40"
          defaultValue="en"
          ref={selectRef}
        >
          {catalog
            .filter(
              (language) =>
                !languageList.some((code) => code === language.code),
            )
            .map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
        </Select>

        <Button onClick={onAddLanguage}>追加</Button>
      </div>
    </div>
  );
}

export function LanguageDetectionFallbackSelect({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const { autoDetection, updateSettings } = useSettingsStore();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      updateSettings((settings) => ({
        ...settings,
        autoDetection: {
          ...settings.autoDetection,
          fallbackTo: event.target.value as DetectableLanguageDto,
        },
      }));
    },
    [updateSettings],
  );

  return (
    <Select
      name={name}
      id={id}
      value={autoDetection.fallbackTo}
      onChange={onChange}
    >
      {filterWithDetectable("all").map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </Select>
  );
}
