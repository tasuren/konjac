import { useCallback, useEffect } from "react";
import { create } from "zustand";
import type { ModelDto } from "../../rust-bindings/ModelDto";
import type { ProviderKindDto } from "../../rust-bindings/ProviderKindDto";
import type { ProviderSettingsDto } from "../../rust-bindings/ProviderSettingsDto";
import { listProviderModels } from "../tauri/translation";
import { useSettingsStore } from "./settingsStore";

export type ModelCatalogStatus = "idle" | "loading" | "ready" | "error";

export type ModelCatalogEntry = {
  status: ModelCatalogStatus;
  models: ModelDto[];
  error: string | null;
  requestId: number;
};

export type ModelCatalogStore = {
  entries: Partial<Record<ProviderKindDto, ModelCatalogEntry>>;
  refreshProvider: (
    provider: ProviderKindDto,
    settings: ProviderSettingsDto,
  ) => Promise<void>;
};

const DEFAULT_ENTRY: ModelCatalogEntry = {
  status: "idle",
  models: [],
  error: null,
  requestId: 0,
};

let nextCatalogRequestId = 0;

function getEntry(entry?: ModelCatalogEntry): ModelCatalogEntry {
  return entry ?? DEFAULT_ENTRY;
}

export function modelKey(model: Pick<ModelDto, "provider" | "id">) {
  return `${model.provider}-${model.id}`;
}

export const useModelCatalogStore = create<ModelCatalogStore>((set) => ({
  entries: {},
  refreshProvider: async (provider, settings) => {
    const requestId = ++nextCatalogRequestId;

    set((state) => {
      const current = getEntry(state.entries[provider]);

      return {
        entries: {
          ...state.entries,
          [provider]: {
            ...current,
            status: "loading",
            error: null,
            requestId,
          },
        },
      };
    });

    try {
      const models = await listProviderModels(provider, settings);

      set((state) => {
        const current = getEntry(state.entries[provider]);
        if (current.requestId !== requestId) return state;

        return {
          entries: {
            ...state.entries,
            [provider]: {
              status: "ready",
              models,
              error: null,
              requestId,
            },
          },
        };
      });
    } catch (error) {
      set((state) => {
        const current = getEntry(state.entries[provider]);
        if (current.requestId !== requestId) return state;

        return {
          entries: {
            ...state.entries,
            [provider]: {
              ...current,
              status: "error",
              error: String(error),
              requestId,
            },
          },
        };
      });
    }
  },
}));

// Returns provider model catalog state and keeps it refreshed from settings.
export function useProviderModelCatalog(provider: ProviderKindDto) {
  const providerSettings = useSettingsStore((state) => state.providers);

  const entry = useModelCatalogStore(
    (state) => state.entries[provider] ?? DEFAULT_ENTRY,
  );
  const refreshProvider = useModelCatalogStore(
    (state) => state.refreshProvider,
  );

  const refresh = useCallback(
    () => refreshProvider(provider, providerSettings),
    [provider, providerSettings, refreshProvider],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshProvider(provider, providerSettings);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [
    provider,
    providerSettings,
    providerSettings.ollama.baseUrl,
    refreshProvider,
  ]);

  return {
    ...entry,
    refresh,
  };
}
