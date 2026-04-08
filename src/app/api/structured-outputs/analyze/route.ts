import { generateText, Output } from "ai";
import { formatApiError } from "@/lib/format-api-error";
import type { LanguageModelId } from "@/lib/model-selectors";
import { normalizeLanguageModelUsage } from "@/lib/normalize-language-model-usage";
import { getModel } from "@/lib/openai";
import {
  analyzeBodySchema,
  type SchemaName,
  structuredOutputSchemaByName,
} from "@/lib/schemas";
import { buildStructuredOutputErrorPayload } from "@/lib/structured-output-failure";
import { STRUCTURED_OUTPUT_SYSTEM } from "@/lib/structured-output-prompt";
import { validateRequest } from "@/lib/validate-api";

async function analyzeWithSchema(
  text: string,
  schemaName: SchemaName,
  modelId: LanguageModelId,
) {
  const prompt = `Analyze the following text and extract structured information:\n\n${text}`;
  const model = getModel(modelId);
  const schema = structuredOutputSchemaByName[schemaName];

  const result = await generateText({
    model,
    system: STRUCTURED_OUTPUT_SYSTEM,
    output: Output.object({ schema }),
    prompt,
    experimental_telemetry: { isEnabled: true },
  });

  return {
    output: result.output,
    usage: normalizeLanguageModelUsage(result.totalUsage ?? result.usage),
    reasoning: result.reasoning.map((r) => ({ text: r.text })),
    reasoningText: result.reasoningText ?? null,
    rawModelText: result.text,
  };
}

export const POST = validateRequest(
  analyzeBodySchema,
  async ({ text, schemaName, modelId }) => {
    try {
      const result = await analyzeWithSchema(text, schemaName, modelId);
      return Response.json(result);
    } catch (error) {
      console.error("Structured output error:", error);
      const { status, body } = buildStructuredOutputErrorPayload(error);
      if (!body.error?.trim()) {
        body.error = formatApiError(error);
      }
      return Response.json(body, { status });
    }
  },
);
