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
import { getStructuredOutputSystem } from "@/lib/structured-output-prompt";
import { getThinkingProviderOptions } from "@/lib/thinking-provider-options";
import { validateRequest } from "@/lib/validate-api";

async function analyzeWithSchema(
  text: string,
  schemaName: SchemaName,
  modelId: LanguageModelId,
  thinking: boolean,
) {
  const prompt = `Analyze the following text and extract structured information:\n\n${text}`;
  const model = getModel(modelId);
  const schema = structuredOutputSchemaByName[schemaName];

  const result = await generateText({
    model,
    system: getStructuredOutputSystem(thinking),
    output: Output.object({ schema }),
    prompt,
    experimental_telemetry: { isEnabled: true },
    ...(thinking ? { providerOptions: getThinkingProviderOptions() } : {}),
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
  async ({ text, schemaName, modelId, thinking }) => {
    try {
      const result = await analyzeWithSchema(
        text,
        schemaName,
        modelId,
        thinking,
      );
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
