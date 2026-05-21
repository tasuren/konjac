import { useCallback, useEffect, useRef, useState } from "react";
import type { SourceLanguageDto } from "../../../rust-bindings/SourceLanguageDto";
import type { TargetLanguageDto } from "../../../rust-bindings/TargetLanguageDto";
import { requestTranslation } from "../../../shared/tauri/translation";
import type { TranslationModelSelection } from "../stores/translationSelectionStore";

export type TranslationStatus = "idle" | "translating" | "error";

export type UseTranslationSessionOptions = {
  sourceLanguage: SourceLanguageDto;
  targetLanguage: TargetLanguageDto;
  model: TranslationModelSelection | null;
  debounceMs: number;
};

export type UseTranslationSessionResult = {
  output: string;
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
}: UseTranslationSessionOptions): UseTranslationSessionResult {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<TranslationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isComposingRef = useRef(false);
  const lastRequestedTextRef = useRef("");

  const translate = useCallback(
    async (text: string) => {
      const normalizedText = text.trim();

      if (
        model === null ||
        isComposingRef.current ||
        normalizedText === "" ||
        normalizedText === lastRequestedTextRef.current
      ) {
        return;
      }

      lastRequestedTextRef.current = normalizedText;
      setStatus("translating");

      const { dispose, resolvedSourceLanguage } = await requestTranslation(
        {
          provider: model.provider,
          modelId: model.id,
          sourceLanguage,
          targetLanguage,
          text: normalizedText,
        },
        {
          onDelta(fullText) {
            setOutput(fullText);
          },
          onFinished(fullText) {
            setStatus("idle");
            setOutput(fullText);
            dispose();
          },
          onFailed(message) {
            setError(message);
          },
        },
      );
    },
    [sourceLanguage, targetLanguage, model, model?.provider, model?.id],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    void translate(input);
  }, [input, translate]);

  const timeoutRef = useRef(0);
  useEffect(() => {
    if (input.trim().length === 0) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      void translate(input);
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [input, debounceMs, translate]);

  return {
    output,
    setInput,
    status,
    error,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
