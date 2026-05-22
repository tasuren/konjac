import type React from "react";
import { useCallback } from "react";
import { toMarkdown } from "../../../shared/tauri/translation";

export type TranslationInputBoxProps = {
  setInput: (text: string) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
};

export function TranslationInputBox({
  setInput,
  handleCompositionStart,
  handleCompositionEnd,
}: TranslationInputBoxProps) {
  const onPaste = useCallback(
    async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (event.clipboardData === null) return;

      const html = event.clipboardData.getData("text/html");
      if (!html) return;
      const markdown = await toMarkdown(html);

      event.preventDefault();

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
