import { cn } from "@sglara/cn";
import { cjk } from "@streamdown/cjk";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Copy, Loader, LoaderCircle, Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Streamdown } from "streamdown";
import type { ModelSelectionDto } from "../../../rust-bindings/ModelSelectionDto";
import { CustomLinkModal } from "../../../shared/components/CustomLinkModal";
import { IconButton } from "../../../shared/components/IconButton";
import type { TranslationStatus } from "../hooks/useTranslationSession";

export type TranslationOutputProps = {
  model: ModelSelectionDto | null;
  input: string;
  output: string;
  status: TranslationStatus;
  availabilityError: string | null;
  translationError: string | null;
};

export function TranslationOutput({
  model,
  input,
  output,
  status,
  availabilityError,
  translationError,
}: TranslationOutputProps) {
  const [lastInput, setLastInput] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "requesting") setLastInput(input);
  }, [input, status]);

  const onCopy = useCallback(async () => {
    writeText(output);
  }, [output]);

  const [maximized, setMaximized] = useState(false);
  const maximizeToggleTitle = maximized
    ? t("translation.minimize")
    : t("translation.maximize");
  const toggleMaximize = () => setMaximized(!maximized);

  if (model === null)
    return (
      <div className="w-1/2">
        <p>{t("translation.noModel")}</p>
      </div>
    );

  const requesting = status === "requesting";
  const translating = status === "translating";
  const visibleError = availabilityError ?? translationError;
  const errorTitle =
    availabilityError !== null
      ? t("translation.unavailable")
      : t("translation.failed");
  const showOutput =
    (!requesting && translating) || (input.length > 0 && input === lastInput);

  return (
    <div
      className={cn(
        "border border-border bg-surface rounded-xl flex flex-col justify-between",
        maximized ? "absolute top-14 left-3 right-3 bottom-3" : "w-1/2",
      )}
    >
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {requesting ? (
            <Requesting />
          ) : visibleError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 text-sm text-muted overflow-y-auto"
            >
              {errorTitle}
              <br />
              <code className="wrap-break-word select-auto cursor-auto">
                {visibleError}
              </code>
            </motion.div>
          ) : showOutput ? (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 h-full overflow-y-auto select-text cursor-auto"
            >
              <Streamdown
                plugins={{ cjk }}
                controls={{ code: { download: false } }}
                remend={{ linkMode: "text-only" }}
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
              {t("translation.placeholder")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="h-12 px-4 flex justify-end items-center gap-4">
        <AnimatePresence>
          {input && output && status === "idle" && (
            <motion.div
              className="flex gap-4"
              key="copy-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <IconButton
                title={t("translation.copy")}
                aria-label={t("translation.copy")}
                onClick={onCopy}
              >
                <Copy />
              </IconButton>
            </motion.div>
          )}
          {status === "translating" && (
            <motion.div
              key="translating-spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
            >
              <LoaderCircle className="text-muted/60 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <IconButton
          title={maximizeToggleTitle}
          aria-label={maximizeToggleTitle}
          onClick={toggleMaximize}
        >
          {maximized ? <Minimize2 /> : <Maximize2 />}
        </IconButton>
      </div>
    </div>
  );
}

function Requesting({ pulseStartsAt = 1000 }: { pulseStartsAt?: number }) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
      {t("translation.requesting")}
      <Loader size={14} className="inline animate-[spin_2s_linear_infinite]" />
    </motion.div>
  );
}
