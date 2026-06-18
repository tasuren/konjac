import { cn } from "@sglara/cn";
import { platform } from "@tauri-apps/plugin-os";
import { Trash2 } from "lucide-react";
import { type ClipboardEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../../../shared/components/IconButton";
import { SegmentedControl } from "../../../shared/components/SegmentedControl";
import { toMarkdown } from "../../../shared/tauri/translation";

export type ClipboardInputMode = "text" | "markdown";

export type ClipboardInputVariants = {
  rawInput: string;
  markdownInput: string;
};

export type TranslationInputProps = {
  input: string;
  setInput: (text: string) => void;
  clipboardInputMode: ClipboardInputMode;
  setClipboardInputMode: (mode: ClipboardInputMode) => void;
  applyClipboardInputVariants: (variants: ClipboardInputVariants) => void;
  quickCopyTranslateEnabled: boolean;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
};

const quickCopyShortcut = platform() === "macos" ? "⌘C" : "Ctrl+C";

export function TranslationInput({
  input,
  setInput,
  clipboardInputMode,
  setClipboardInputMode,
  applyClipboardInputVariants,
  quickCopyTranslateEnabled,
  handleCompositionStart,
  handleCompositionEnd,
}: TranslationInputProps) {
  const { t } = useTranslation();
  const placeholder = quickCopyTranslateEnabled
    ? t("translation.inputPlaceholderWithQuickCopy", {
        shortcut: quickCopyShortcut,
      })
    : t("translation.inputPlaceholder");

  const onPaste = useCallback(
    async (event: ClipboardEvent<HTMLTextAreaElement>) => {
      if (event.clipboardData === null) return;

      const html = event.clipboardData.getData("text/html");
      if (!html) return;

      const target = event.currentTarget;
      const pastedIntoInput = target.value;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const rawText = event.clipboardData.getData("text/plain") || html;

      event.preventDefault();

      const markdown = await toMarkdown(html).catch(() => rawText);

      applyClipboardInputVariants({
        rawInput: replaceTextRange(pastedIntoInput, start, end, rawText),
        markdownInput: replaceTextRange(pastedIntoInput, start, end, markdown),
      });
    },
    [applyClipboardInputVariants],
  );

  const clipboardInputModeOptions: Array<{
    value: ClipboardInputMode;
    label: string;
    title: string;
  }> = [
    {
      value: "text",
      label: t("translation.clipboardInputText"),
      title: t("translation.useClipboardTextInput"),
    },
    {
      value: "markdown",
      label: t("translation.clipboardInputMarkdown"),
      title: t("translation.useClipboardMarkdownInput"),
    },
  ];

  return (
    <div
      className={cn(
        "flex-1 basis-0 min-w-0 h-full border border-border rounded-xl bg-surface flex flex-col",
        "focus-within:outline-2 focus-within:outline-accent",
      )}
    >
      <textarea
        placeholder={placeholder}
        className="flex-1 min-h-0 w-full p-4 overflow-y-auto select-auto resize-none bg-transparent focus-visible:outline-none!"
        value={input}
        onPaste={onPaste}
        onChange={(event) => setInput(event.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={(event) => {
          handleCompositionEnd();
          setInput(event.currentTarget.value);
        }}
      ></textarea>

      <div className="h-13 shrink-0 px-3 flex justify-between items-center gap-4">
        <SegmentedControl
          legend={t("translation.clipboardInputMode")}
          value={clipboardInputMode}
          options={clipboardInputModeOptions}
          onChange={setClipboardInputMode}
        />

        <div className="flex shrink-0 items-center gap-4">
          {input.length > 0 && (
            <IconButton
              title={t("translation.inputClear")}
              aria-label={t("translation.inputClear")}
              onClick={() => setInput("")}
            >
              <Trash2 />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

function replaceTextRange(
  text: string,
  start: number,
  end: number,
  replacement: string,
) {
  return text.slice(0, start) + replacement + text.slice(end);
}
