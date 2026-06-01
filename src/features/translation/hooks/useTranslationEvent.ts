import { useCallback, useEffect, useRef, useState } from "react";
import type { ProviderKindDto } from "../../../rust-bindings/ProviderKindDto";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";
import { requestTranslation } from "../../../shared/tauri/translation";

export type TranslationStatus = "idle" | "requesting" | "translating";

export type UseTranslationSessionOptions = {
  sourceLanguage: SourceLanguageDto;
  targetLanguage: TargetLanguageDto;
  model: { provider: ProviderKindDto; id: string } | null;
  debounceMs: number;
  setResolvedSourceLanguage: (value: ResolvedSourceLanguageDto) => void;
};

export type UseTranslationSessionResult = {
  output: string;
  input: string;
  setInput: (value: string) => void;
  status: TranslationStatus;
  error: string | null;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
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
}: UseTranslationSessionOptions): UseTranslationSessionResult {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<TranslationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (text: string) => {
      if (model === null) {
        return;
      }

      setStatus("requesting");

      const { dispose, resolvedSourceLanguage } = await requestTranslation(
        {
          provider: model.provider,
          modelId: model.id,
          sourceLanguage,
          targetLanguage,
          text: text,
        },
        {
          onDelta(fullText) {
            setStatus("translating");
            setOutput(fullText);
          },
          onFinished(fullText) {
            setOutput(fullText);
            dispose();
            setStatus("idle");
          },
          onFailed(message) {
            dispose();
            setError(message);
            setStatus("idle");
          },
        },
      );

      setResolvedSourceLanguage(resolvedSourceLanguage);
    },
    [
      sourceLanguage,
      targetLanguage,
      model,
      model?.provider,
      model?.id,
      setResolvedSourceLanguage,
    ],
  );

  const isComposingRef = useRef(false);
  const lastRequestedKeyRef = useRef("");

  // Prevent translation during IME composition.
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    void translate(input);
  }, [input, translate]);

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
      isComposingRef.current ||
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
  }, [input, debounceMs, translate, sourceLanguage, targetLanguage, model]);

  return {
    output,
    input,
    setInput,
    status: status,
    error,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
