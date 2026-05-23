import { useCallback, useEffect, useRef, useState } from "react";
import type { ResolvedSourceLanguageDto } from "../../../rust-bindings/ResolvedSourceLanguageDto";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";
import { requestTranslation } from "../../../shared/tauri/translation";
import type { TranslationModelSelection } from "../stores/translationSelectionStore";

export type TranslationStatus = "idle" | "requesting" | "translating";

export type UseTranslationSessionOptions = {
  sourceLanguage: SourceLanguageDto;
  targetLanguage: TargetLanguageDto;
  model: TranslationModelSelection | null;
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
  const lastRequestedTextRef = useRef("");

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

    if (
      normalizedText.length === 0 ||
      isComposingRef.current ||
      normalizedText === lastRequestedTextRef.current
    ) {
      return;
    }

    lastRequestedTextRef.current = normalizedText;
    timeoutRef.current = setTimeout(() => {
      void translate(input);
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [input, debounceMs, translate]);

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
