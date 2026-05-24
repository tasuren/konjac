import { create } from "zustand";
import type { ModelDto } from "../../rust-bindings/ModelDto";
import type { ProviderKindDto } from "../../rust-bindings/ProviderKindDto";

export function genModelKey(model: TranslationModelSelection): string {
  return `${model.provider}-${model.id}`;
}

export type TranslationModelSelection = {
  provider: ProviderKindDto;
  id: string;
};

export type TranslationModelStore = {
  model: TranslationModelSelection | null;
  models: Map<string, ModelDto>;
  setModel: (model: TranslationModelSelection) => void;
  setModels: (models: ModelDto[]) => void;
};

export const useTranslationModelStore = create<TranslationModelStore>(
  (set) => ({
    model: null,
    models: new Map(),
    setModel: (model) => set({ model }),
    setModels: (models: ModelDto[]) =>
      set({
        models: new Map(models.map((model) => [genModelKey(model), model])),
      }),
  }),
);
