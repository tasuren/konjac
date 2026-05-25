import { create } from "zustand";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";
import { getSettings } from "../../../shared/tauri/settings";

export type TranslationSelectionStore = {
  sourceLanguage: SourceLanguageDto;
  resolvedSourceLanguage: ResolvedSourceLanguageDto | null;
  targetLanguage: TargetLanguageDto;

  setSourceLanguage: (sourceLanguage: SourceLanguageDto) => void;
  setResolvedSourceLanguage: (
    resolvedSourceLanguage: ResolvedSourceLanguageDto,
  ) => void;
  setTargetLanguage: (targetLanguage: TargetLanguageDto) => void;
};

const settings = await getSettings();
export const useTranslationSelectionStore = create<TranslationSelectionStore>(
  (set) => ({
    sourceLanguage: settings.defaultSourceLanguage,
    resolvedSourceLanguage: null,
    targetLanguage: settings.defaultTargetLanguage,

    setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
    setResolvedSourceLanguage: (resolvedSourceLanguage) =>
      set({ resolvedSourceLanguage }),
    setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  }),
);
