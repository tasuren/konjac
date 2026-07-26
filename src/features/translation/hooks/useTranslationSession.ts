import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderKindDto } from "../../../rust-bindings/ProviderKindDto";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import type { ResolvedTargetLanguageDto } from "../../../rust-bindings/ResolvedTargetLanguageDto";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";
import {
  modelKey,
  useProviderModelCatalog,
} from "../../../shared/stores/modelCatalogStore";
import { requestTranslation } from "../../../shared/tauri/translation";

export type TranslationStatus = "idle" | "requesting" | "translating";

export type UseTranslationSessionOptions = {
  sourceLanguage: SourceLanguageDto;
  targetLanguage: TargetLanguageDto;
  model: { provider: ProviderKindDto; id: string } | null;
  debounceMs: number;
  setResolvedSourceLanguage: (value: ResolvedSourceLanguageDto) => void;
  setTargetLanguage: (value: ResolvedTargetLanguageDto) => void;
};

export type UseTranslationSessionResult = {
  output: string;
  input: string;
  setInput: (value: string) => void;
  status: TranslationStatus;
  availabilityError: string | null;
  translationError: string | null;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
  swapInputOutput: () => void;
};

function createTranslationRequestKey({
  model,
  sourceLanguage,
  targetLanguage,
  text,
}: {
  model: { provider: ProviderKindDto; id: string } | null;
  sourceLanguage: SourceLanguageDto;
  targetLanguage: TargetLanguageDto;
  text: string;
}) {
  return JSON.stringify({
    model,
    sourceLanguage,
    targetLanguage,
    text,
  });
}

export function useTranslationSession({
  sourceLanguage,
  targetLanguage,
  model,
  debounceMs,
  setResolvedSourceLanguage,
  setTargetLanguage,
}: UseTranslationSessionOptions): UseTranslationSessionResult {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<TranslationStatus>("idle");
  const [translationError, setTranslationError] = useState<string | null>(null);

  const { t } = useTranslation();
  const provider = model?.provider ?? "ollama";
  const catalog = useProviderModelCatalog(provider);

  const selectedModelAvailable =
    model === null ||
    catalog.status !== "ready" ||
    catalog.models.some(
      (availableModel) => modelKey(availableModel) === modelKey(model),
    );
  const providerUnavailableError =
    model !== null && catalog.status === "error"
      ? t("translation.providerUnavailable", { provider: model.provider })
      : null;
  const selectedModelUnavailableError =
    model !== null && !selectedModelAvailable
      ? t("llm.selectedModelUnavailable")
      : null;
  const availabilityError =
    providerUnavailableError ?? selectedModelUnavailableError;

  // Tracks the most recently started request so that results from a
  // superseded (but not yet disposed) request can't clobber newer state.
  const requestGenerationRef = useRef(0);

  const translate = useCallback(
    async (text: string) => {
      if (model === null) {
        return;
      }

      if (availabilityError !== null) {
        setStatus("idle");
        return;
      }

      const generation = ++requestGenerationRef.current;
      const isSuperseded = () => requestGenerationRef.current !== generation;

      setStatus("requesting");
      setTranslationError(null);

      try {
        const { dispose, resolvedSourceLanguage, resolvedTargetLanguage } =
          await requestTranslation(
            {
              provider: model.provider,
              modelId: model.id,
              sourceLanguage,
              targetLanguage,
              text: text,
            },
            {
              onDelta(fullText) {
                if (isSuperseded()) return;
                setStatus("translating");
                setOutput(fullText);
              },
              onFinished(fullText) {
                dispose();
                if (isSuperseded()) return;
                setOutput(fullText);
                setTranslationError(null);
                setStatus("idle");
              },
              onFailed(message) {
                dispose();
                if (isSuperseded()) return;
                setTranslationError(message);
                setStatus("idle");
              },
            },
          );

        if (isSuperseded()) return;
        setResolvedSourceLanguage(resolvedSourceLanguage);
        setTargetLanguage(resolvedTargetLanguage);
      } catch {
        if (!isSuperseded()) setStatus("idle");
      }
    },
    [
      sourceLanguage,
      targetLanguage,
      model,
      model?.provider,
      model?.id,
      availabilityError,
      setResolvedSourceLanguage,
      setTargetLanguage,
    ],
  );

  const [isComposing, setIsComposing] = useState(false);
  const lastRequestedKeyRef = useRef("");

  // Prevent translation during IME composition.
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const swapInputOutput = useCallback(() => {
    setInput(output);
    setOutput(input);
  }, [input, output]);

  // Translation runner with debounce
  const timeoutRef = useRef(0);
  useEffect(() => {
    const normalizedText = input.trim();
    const requestKey = createTranslationRequestKey({
      model,
      sourceLanguage,
      targetLanguage,
      text: normalizedText,
    });

    if (
      normalizedText.length === 0 ||
      availabilityError !== null ||
      isComposing ||
      requestKey === lastRequestedKeyRef.current
    ) {
      return;
    }

    lastRequestedKeyRef.current = requestKey;
    timeoutRef.current = setTimeout(() => {
      void translate(input);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [
    input,
    debounceMs,
    translate,
    sourceLanguage,
    targetLanguage,
    model,
    availabilityError,
    isComposing,
  ]);

  return {
    output,
    input,
    setInput,
    status: status,
    availabilityError,
    translationError,
    handleCompositionStart,
    handleCompositionEnd,
    swapInputOutput,
  };
}
