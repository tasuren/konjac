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
  const languageListScope = useSettingsStore(
    (state) => state.languageListScope,
  );
  const customLanguageListScope = useSettingsStore(
    (state) => state.customLanguageListScope,
  );
  const languageDetectionScope = useSettingsStore(
    (state) => state.languageDetection.scope,
  );
  const customDetectionScope = useSettingsStore(
    (state) => state.languageDetection.customDetectionScope,
  );
  const [languages, setLanguages] = useState<LanguageInfoDto[]>([]);
  const [detectableLanguages, setDetectableLanguages] = useState<
    LanguageInfoDto[]
  >([]);

  useEffect(() => {
    setLanguages(filterWithScope(languageListScope, customLanguageListScope));
  }, [languageListScope, customLanguageListScope]);

  useEffect(() => {
    setDetectableLanguages(
      filterWithDetectableScope(languageDetectionScope, customDetectionScope),
    );
  }, [languageDetectionScope, customDetectionScope]);

  return { languages, detectableLanguages };
}
