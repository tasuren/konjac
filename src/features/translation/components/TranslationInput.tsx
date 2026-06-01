import { type ClipboardEvent, useCallback } from "react";
import { toMarkdown } from "../../../shared/tauri/translation";

export type TranslationInputProps = {
  setInput: (text: string) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
};

export function TranslationInput({
  setInput,
  handleCompositionStart,
  handleCompositionEnd,
}: TranslationInputProps) {
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
    <textarea
      placeholder="翻訳したいテキストを入力"
      className="p-4 w-1/2 border border-border rounded-xl h-full overflow-y-auto select-auto"
      onPaste={onPaste}
      onChange={(event) => setInput(event.target.value)}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={(event) => {
        handleCompositionEnd();
        setInput(event.currentTarget.value);
      }}
    ></textarea>
  );
}
