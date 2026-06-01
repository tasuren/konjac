import { type Event, listen } from "@tauri-apps/api/event";
import type { QuickCopyTranslationInputDto } from "../../rust-bindings/QuickCopyTranslationInputDto";

export async function listenQuickCopyTranslationInput(
  handler: (payload: QuickCopyTranslationInputDto) => void,
) {
  return await listen(
    "quick-copy-translation-input",
    (event: Event<QuickCopyTranslationInputDto>) => {
      handler(event.payload);
    },
  );
}
