import { useEffect, useState } from "react";
import type { LanguageInfoDto } from "../../../rust-bindings/LanguageInfoDto";
import { useSettingsStore } from "../../../shared/stores/settingsStore";
import {
  filterWithDetectable as filterWithDetectableScope,
  filterWithScope,
} from "../../../shared/tauri/language";

export function useLanguageCatalog(): {
  languages: LanguageInfoDto[];
  detectableLanguages: LanguageInfoDto[];
} {
  const { languageListScope, customLanguageListScope, autoDetection } =
    useSettingsStore();
  const [languages, setLanguages] = useState<LanguageInfoDto[]>([]);
  const [detectableLanguages, setDetectableLanguages] = useState<
    LanguageInfoDto[]
  >([]);

  useEffect(() => {
    setLanguages(filterWithScope(languageListScope, customLanguageListScope));
  }, [languageListScope, customLanguageListScope]);

  useEffect(() => {
    setDetectableLanguages(
      filterWithDetectableScope(
        autoDetection.scope,
        autoDetection.customDetectionScope,
      ),
    );
  }, [autoDetection.scope, autoDetection.customDetectionScope]);

  return { languages, detectableLanguages };
}
