import { cn } from "@sglara/cn";
import { Trash2 } from "lucide-react";
import { type ClipboardEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../../../shared/components/IconButton";
import { toMarkdown } from "../../../shared/tauri/translation";

export type TranslationInputProps = {
  input: string;
  setInput: (text: string) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
};

export function TranslationInput({
  input,
  setInput,
  handleCompositionStart,
  handleCompositionEnd,
}: TranslationInputProps) {
  const { t } = useTranslation();

  const onPaste = useCallback(
    async (event: ClipboardEvent<HTMLTextAreaElement>) => {
      if (event.clipboardData === null) return;

      const html = event.clipboardData.getData("text/html");
      if (!html) return;

      event.preventDefault();
      const markdown = await toMarkdown(html);

      // We mainly use deprecated `execCommand` to support undo.
      // TODO: Use selection approach with undo feature.
      const methodName: string = "execCommand";
      // @ts-expect-error
      const execCommand = (...obj) => document[methodName](...obj);

      if (execCommand) {
        execCommand("insertText", false, markdown);
      } else {
        const selection = getSelection();
        if (selection === null) return;

        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(markdown));
      }
    },
    [],
  );

  return (
    <div
      className={cn(
        "flex-1 basis-0 min-w-0 h-full border border-border rounded-xl bg-surface flex flex-col",
        "focus-within:outline-2 focus-within:outline-accent",
      )}
    >
      <textarea
        placeholder={t("translation.inputPlaceholder")}
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

      <div className="h-13 shrink-0 px-3 flex justify-end items-center gap-4">
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
  );
}
