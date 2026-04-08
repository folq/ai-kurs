import { Output, streamText } from "ai";
import { formatApiError } from "@/lib/format-api-error";
import { getModel } from "@/lib/openai";
import {
  analyzeBodySchema,
  type SchemaName,
  structuredOutputSchemaByName,
} from "@/lib/schemas";
import { buildStructuredOutputErrorPayload } from "@/lib/structured-output-failure";
import { STRUCTURED_OUTPUT_SYSTEM } from "@/lib/structured-output-prompt";
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

      return result.toTextStreamResponse();
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
