import { invoke } from "@tauri-apps/api/core";
import { type Event, listen } from "@tauri-apps/api/event";
import type { LanguageInfoDto } from "../../rust-bindings/LanguageInfoDto";
import type { ResolvedSourceLanguageDto } from "../../rust-bindings/ResolvedSourceLanguageDto";
import type { TranslationRequestDto } from "../../rust-bindings/TranslationRequestDto";
import type { TranslationRequestResultDto } from "../../rust-bindings/TranslationRequestResultDto";
import type { TranslationStreamEventDto } from "../../rust-bindings/TranslationStreamEventDto";

export type TranslationStreamHandlers = {
  onDelta: (fullText: string) => void;
  onFinished: (fullText: string) => void;
  onFailed: (message: string) => void;
};

export type TranslationRequest = Omit<TranslationRequestDto, "requestId">;

export type TranslationRequestResult = {
  resolvedSourceLanguage: ResolvedSourceLanguageDto;
  dispose: () => void;
};

export async function requestTranslation(
  request: TranslationRequest,
  handlers: TranslationStreamHandlers,
): Promise<TranslationRequestResult> {
  const requestId: number = await invoke("next_translation_request_id");
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    unlisten();
  };

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
          dispose();
          break;
        case "cancelled":
          dispose();
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
      dispose,
      ...result,
    };
  } catch (error) {
    disposed = true;
    unlisten();
    handlers.onFailed(error as string);
    throw error;
  }
}

export async function listLanguages(): Promise<LanguageInfoDto[]> {
  return await invoke("list_languages");
}

export async function toMarkdown(html: string): Promise<string> {
  return await invoke("to_markdown", { html });
}
