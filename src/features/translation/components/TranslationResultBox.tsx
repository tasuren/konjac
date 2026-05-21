import { cn } from "@sglara/cn";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { TranslationStatus } from "../hooks/useTranslationEvent";
import type { TranslationModelSelection } from "../stores/translationSelectionStore";

export type TranslationResultBoxProps = {
  model: TranslationModelSelection | null;
  input: string;
  output: string;
  status: TranslationStatus;
};

export function TranslationResultBox({
  model,
  input,
  output,
  status,
}: TranslationResultBoxProps) {
  const [lastInput, setLastInput] = useState("");

  useEffect(() => {
    if (status === "requesting") setLastInput(input);
  }, [input, status]);

  const baseClassName = "p-4 w-1/2 border border-border bg-surface rounded-xl";

  if (model === null)
    return (
      <div>
        <p>
          現在、翻訳を処理するAIモデルが設定されていません。設定後、翻訳が可能となります。
        </p>
      </div>
    );

  if (status === "requesting")
    return <Requesting className={baseClassName} pulseStartsAt={500} />;

  const showOutput =
    status === "translating" || (input.length > 0 && input === lastInput);

  return (
    <div className={baseClassName}>
      <AnimatePresence mode="wait">
        {showOutput ? (
          <motion.div
            key="output"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {output}
          </motion.div>
        ) : (
          <motion.p
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            翻訳結果はこちらに表示されます。
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Requesting({
  className,
  pulseStartsAt,
}: {
  className: string;
  pulseStartsAt: number;
}) {
  const [pulse, setPulse] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setPulse("animate-pulse"), pulseStartsAt);
    return () => clearTimeout(timeout);
  }, [pulseStartsAt]);

  return <div className={cn(className, pulse)}>{}</div>;
}
