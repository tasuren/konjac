import { create } from "zustand";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";

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

export const useTranslationSelectionStore = create<TranslationSelectionStore>(
  (set) => ({
    sourceLanguage: { type: "autoDetect" },
    resolvedSourceLanguage: null,
    targetLanguage: { name: "English", code: "en" },

    setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
    setResolvedSourceLanguage: (resolvedSourceLanguage) =>
      set({ resolvedSourceLanguage }),
    setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  }),
);
