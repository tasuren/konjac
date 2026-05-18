import { invoke } from "@tauri-apps/api/core";
import { type Event, listen } from "@tauri-apps/api/event";
import type { ResolvedSourceLanguageDto } from "../../rust-bindings/ResolvedSourceLanguageDto";
import type { TranslationRequestDto } from "../../rust-bindings/TranslationRequestDto";
import type { TranslationRequestResultDto } from "../../rust-bindings/TranslationRequestResultDto";
import type { TranslationStreamEventDto } from "../../rust-bindings/TranslationStreamEventDto";

export type TranslationStreamHandlers = {
  onDelta: (fullText: string) => void;
  onFinished: (fullText: string) => void;
  onFailed: (message: string) => void;
};

type TranslationRequest = Omit<TranslationRequestDto, "requestId">;

type TranslationRequestResult = {
  resolvedSourceLanguage: ResolvedSourceLanguageDto;
  dispose: () => void;
};

export async function requestTranslation(
  request: TranslationRequest,
  handlers: TranslationStreamHandlers,
): Promise<TranslationRequestResult> {
  const requestId: number = await invoke("next_translation_request_id");
  let disposed = false;

  const unlisten = await listen(
    "translation-stream-event",
    (event: Event<TranslationStreamEventDto>) => {
      if (disposed || event.payload.requestId !== requestId) return;

      switch (event.payload.type) {
        case "delta":
          handlers.onDelta(event.payload.fullText);
          break;
        case "finished":
          handlers.onFinished(event.payload.fullText);
          break;
      }
    },
  );

  const requestData: TranslationRequestDto = {
    requestId,
    ...request,
  };

  try {
    const result: TranslationRequestResultDto = await invoke(
      "request_translation",
      { request: requestData },
    );
    return {
      dispose: () => {
        if (disposed) return;
        disposed = true;
        unlisten();
      },
      ...result,
    };
  } catch (error) {
    disposed = true;
    unlisten();
    handlers.onFailed(error as string);
    throw error;
  }
}
