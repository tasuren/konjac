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
  availableModels: Map<string, ModelDto>;
  setModel: (model: TranslationModelSelection) => void;
  setAvailableModels: (models: ModelDto[]) => void;
};

export const useTranslationModelStore = create<TranslationModelStore>(
  (set) => ({
    model: null,
    availableModels: new Map(),
    setModel: (model) => set({ model }),
    setAvailableModels: (models: ModelDto[]) =>
      set(({model}) => ({
        model: model === null && models.length > 0 ? models[0] : model,
        availableModels: new Map(
          models.map((model) => [genModelKey(model), model]),
        ),
      })),
  }),
);
