import { cn } from "@sglara/cn";
import { openUrl } from "@tauri-apps/plugin-opener";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import type { LinkSafetyModalProps } from "streamdown";

export function CustomLinkModal({
  url,
  isOpen,
  onClose,
}: LinkSafetyModalProps) {
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
            "backdrop-blur-xs flex justify-center items-center",
          )}
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={onClose}
            aria-label="Close modal"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 select-none bg-modal p-4 rounded-xl flex flex-col gap-2 min-w-1/3 max-w-5/6"
            onMouseUp={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold">External Link</h2>
            <p>You're about to visit:</p>
            <code className="overflow-auto">{url}</code>

            <div className="mt-4 px-2 flex gap-4">
              <button
                type="button"
                className="cursor-pointer px-2 py-1 rounded-lg"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded-lg bg-surface-elevated border border-border cursor-pointer"
                onClick={onConfirm}
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
