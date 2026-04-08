import { Output, streamText } from "ai";
import { formatApiError } from "@/lib/format-api-error";
import { normalizeLanguageModelUsage } from "@/lib/normalize-language-model-usage";
import { getModel } from "@/lib/openai";
import {
  analyzeBodySchema,
  type SchemaName,
  structuredOutputSchemaByName,
} from "@/lib/schemas";
import { buildStructuredOutputErrorPayload } from "@/lib/structured-output-failure";
import { STRUCTURED_OUTPUT_SYSTEM } from "@/lib/structured-output-prompt";
import { encodeSseFromEvent } from "@/lib/structured-output-stream-lines";
import { validateRequest } from "@/lib/validate-api";

export const POST = validateRequest(
  analyzeBodySchema,
  async ({ text, schemaName, modelId }) => {
    const schema = structuredOutputSchemaByName[schemaName as SchemaName];
    if (!schema) {
      return Response.json({ error: "Unknown schema" }, { status: 400 });
    }

    const prompt = `Analyze the following text and extract structured information:\n\n${text}`;

    try {
      const result = streamText({
        model: getModel(modelId),
        system: STRUCTURED_OUTPUT_SYSTEM,
        output: Output.object({ schema }),
        prompt,
        experimental_telemetry: { isEnabled: true },
      });

      const body = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const part of result.fullStream) {
              if (part.type === "reasoning-delta") {
                controller.enqueue(
                  encodeSseFromEvent({ type: "reasoning", text: part.text }),
                );
              } else if (part.type === "text-delta") {
                controller.enqueue(
                  encodeSseFromEvent({
                    type: "text-delta",
                    text: part.text,
                  }),
                );
              } else if (part.type === "finish") {
                controller.enqueue(
                  encodeSseFromEvent({
                    type: "finish",
                    usage: normalizeLanguageModelUsage(part.totalUsage),
                  }),
                );
              } else if (part.type === "error") {
                const err = part.error;
                const message =
                  err instanceof Error
                    ? err.message
                    : String(err ?? "Unknown error");
                controller.enqueue(
                  encodeSseFromEvent({ type: "error", message }),
                );
              }
            }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : String(error ?? "Unknown error");
            controller.enqueue(encodeSseFromEvent({ type: "error", message }));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-store",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      console.error("Structured output stream error:", error);
      const { status, body } = buildStructuredOutputErrorPayload(error);
      if (!body.error?.trim()) {
        body.error = formatApiError(error);
      }
      return Response.json(body, { status });
    }
  },
);
