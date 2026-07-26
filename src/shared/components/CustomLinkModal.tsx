import { cn } from "@sglara/cn";
import { openUrl } from "@tauri-apps/plugin-opener";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { LinkSafetyModalProps } from "streamdown";

export function CustomLinkModal({
  url,
  isOpen,
  onClose,
}: LinkSafetyModalProps) {
  const { t } = useTranslation();

  const onConfirm = useCallback(() => {
    openUrl(url);
    onClose();
  }, [url, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className={cn(
            "absolute top-0 left-0 w-screen h-screen",
            "bg-black/40 flex justify-center items-center",
          )}
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={onClose}
            aria-label={t("linkModal.closeAriaLabel")}
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 select-none bg-modal border border-border shadow-xl p-4 rounded-xl flex flex-col gap-2 min-w-1/3 max-w-5/6"
            onMouseUp={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold">{t("linkModal.title")}</h2>
            <p>{t("linkModal.message")}</p>
            <code className="wrap-anywhere overflow-y-auto max-h-40">
              {url}
            </code>

            <div className="mt-4 px-2 flex gap-4">
              <button
                type="button"
                className="cursor-pointer px-1 py-1.5 rounded-lg"
                onClick={onClose}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-surface-elevated border border-border cursor-pointer"
                onClick={onConfirm}
              >
                {t("common.continue")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
