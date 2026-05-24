import { cjk } from "@streamdown/cjk";
import { Loader } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import { CustomLinkModal } from "../../../shared/components/CustomLinkModal";
import type { TranslationModelSelection } from "../../../shared/stores/translationModelStore";
import type { TranslationStatus } from "../hooks/useTranslationEvent";

export type TranslationResultBoxProps = {
  model: TranslationModelSelection | null;
  input: string;
  output: string;
  status: TranslationStatus;
  error: string | null;
};

export function TranslationResultBox({
  model,
  input,
  output,
  status,
  error,
}: TranslationResultBoxProps) {
  const [lastInput, setLastInput] = useState("");

  useEffect(() => {
    if (status === "requesting") setLastInput(input);
  }, [input, status]);

  const baseClassName = "w-1/2 border border-border bg-surface rounded-xl";

  if (model === null)
    return (
      <div>
        <p>
          現在、翻訳を処理するAIモデルが設定されていません。設定後、翻訳が可能となります。
        </p>
      </div>
    );

  const requesting = status === "requesting";
  const translating = status === "translating";
  const showOutput =
    (!requesting && translating) || (input.length > 0 && input === lastInput);

  return (
    <div className={baseClassName}>
      <AnimatePresence mode="wait">
        {requesting ? (
          <Requesting />
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            ⚠️ 翻訳に失敗しました:
            <code>{error}</code>
          </motion.div>
        ) : showOutput ? (
          <motion.div
            key="output"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4 h-full overflow-y-auto select-auto cursor-auto"
          >
            <Streamdown
              plugins={{ cjk }}
              controls={{ code: { download: false } }}
              linkSafety={{
                enabled: true,
                renderModal: (props) => <CustomLinkModal {...props} />,
              }}
              isAnimating={status === "translating"}
            >
              {output}
            </Streamdown>
          </motion.div>
        ) : (
          <motion.p
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4"
          >
            翻訳結果はこちらに表示されます。
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Requesting({ pulseStartsAt = 1000 }: { pulseStartsAt?: number }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(true), pulseStartsAt);
    return () => clearTimeout(timeout);
  }, [pulseStartsAt]);

  if (!loading) return;

  return (
    <motion.div
      key="requesting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="p-4 flex items-center gap-2"
    >
      リクエスト中です
      <Loader size={14} className="inline animate-[spin_2s_linear_infinite]" />
    </motion.div>
  );
}
