import { X } from "lucide-react";
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
    <div className="w-1/2 h-full relative">
      <textarea
        placeholder={t("translation.inputPlaceholder")}
        className="p-4 pr-13 border border-border rounded-xl w-full h-full overflow-y-auto select-auto"
        value={input}
        onPaste={onPaste}
        onChange={(event) => setInput(event.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={(event) => {
          handleCompositionEnd();
          setInput(event.currentTarget.value);
        }}
      ></textarea>

      <div className="absolute right-0 top-0 p-3">
        {input.length > 0 && (
          <IconButton
            title={t("translation.inputClear")}
            aria-label={t("translation.inputClear")}
            onClick={() => setInput("")}
          >
            <X size={20} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
