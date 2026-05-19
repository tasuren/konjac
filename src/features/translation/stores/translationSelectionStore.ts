import { create } from "zustand";
import type { ProviderKindDto } from "../../../rust-bindings/ProviderKindDto";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";

export type TranslationModelSelection = {
  provider: ProviderKindDto;
  id: string;
};

export type TranslationSelectionStore = {
  sourceLanguage: SourceLanguageDto;
  resolvedSourceLanguage: ResolvedSourceLanguageDto | null;
  targetLanguage: TargetLanguageDto;
  model: TranslationModelSelection | null;

  setSourceLanguage: (sourceLanguage: SourceLanguageDto) => void;
  setResolvedSourceLanguage: (
    resolvedSourceLanguage: ResolvedSourceLanguageDto,
  ) => void;
  setTargetLanguage: (targetLanguage: TargetLanguageDto) => void;
  setModel: (model: TranslationModelSelection) => void;
};

export const useTranslationSelectionStore = create<TranslationSelectionStore>(
  (set) => ({
    sourceLanguage: { type: "autoDetect" },
    resolvedSourceLanguage: null,
    targetLanguage: { name: "English", code: "en" },
    model: { provider: "ollama", id: "translategemma:12b" },

    setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
    setResolvedSourceLanguage: (resolvedSourceLanguage) =>
      set({ resolvedSourceLanguage }),
    setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
    setModel: (model) => set({ model }),
  }),
);
