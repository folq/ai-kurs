import type { ClientUsageStats } from "@/lib/normalize-language-model-usage";

export type StructuredStreamEvent =
  | { type: "reasoning"; text: string }
  | { type: "text-delta"; text: string }
  | { type: "finish"; usage: ClientUsageStats | null }
  | { type: "error"; message: string };

const encoder = new TextEncoder();

export function encodeSseEvent(
  event: string,
  data: Record<string, unknown>,
): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function encodeSseFromEvent(evt: StructuredStreamEvent): Uint8Array {
  switch (evt.type) {
    case "reasoning":
      return encodeSseEvent("reasoning", { text: evt.text });
    case "text-delta":
      return encodeSseEvent("text-delta", { text: evt.text });
    case "finish":
      return encodeSseEvent("finish", { usage: evt.usage });
    case "error":
      return encodeSseEvent("error", { message: evt.message });
  }
}

export async function* parseSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<StructuredStreamEvent> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      let event = "";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event: ")) {
          event = line.slice(7);
        } else if (line.startsWith("data: ")) {
          data = line.slice(6);
        }
      }
      if (!event || !data) continue;
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        if (event === "reasoning" && typeof parsed.text === "string") {
          yield { type: "reasoning", text: parsed.text };
        } else if (event === "text-delta" && typeof parsed.text === "string") {
          yield { type: "text-delta", text: parsed.text };
        } else if (event === "finish") {
          yield {
            type: "finish",
            usage: (parsed.usage as ClientUsageStats) ?? null,
          };
        } else if (event === "error" && typeof parsed.message === "string") {
          yield { type: "error", message: parsed.message };
        }
      } catch {
        /* skip malformed */
      }
    }
  }
}
