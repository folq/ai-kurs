import { generateText, Output } from "ai";
import type { LanguageModelId } from "@/lib/model-selectors";
import { getModel } from "@/lib/openai";
import {
  analyzeBodySchema,
  contentAdvisorySchema,
  contentClassificationSchema,
  movieAnalysisSchema,
  reviewSentimentSchema,
  versionedAnalysisSchema,
  type SchemaName,
} from "@/lib/schemas";
import { validateRequest } from "@/lib/validate-api";

async function analyzeWithSchema(
  text: string,
  schemaName: SchemaName,
  modelId: LanguageModelId,
) {
  const prompt = `Analyze the following text and extract structured information:\n\n${text}`;
  const model = getModel(modelId);

  const telemetry = { isEnabled: true } as const;

  switch (schemaName) {
    case "Filmanalyse": {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: movieAnalysisSchema }),
        prompt,
        experimental_telemetry: telemetry,
      });
      return { output, usage };
    }
    case "Sentimentanalyse": {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: reviewSentimentSchema }),
        prompt,
        experimental_telemetry: telemetry,
      });
      return { output, usage };
    }
    case "Innholdsvarsel": {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: contentAdvisorySchema }),
        prompt,
        experimental_telemetry: telemetry,
      });
      return { output, usage };
    }
    case "Innholdsklassifisering": {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: contentClassificationSchema }),
        prompt,
        experimental_telemetry: telemetry,
      });
      return { output, usage };
    }
    case "Versjonert analyse": {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: versionedAnalysisSchema }),
        prompt,
        experimental_telemetry: telemetry,
      });
      return { output, usage };
    }
  }
}

export const POST = validateRequest(
  analyzeBodySchema,
  async ({ text, schemaName, modelId }) => {
    try {
      const result = await analyzeWithSchema(text, schemaName, modelId);
      return Response.json(result);
    } catch (error) {
      console.error("Structured output error:", error);
      return Response.json(
        { error: "Failed to generate structured output" },
        { status: 500 },
      );
    }
  },
);
