import { generateText, Output } from "ai";
import { getModel } from "@/lib/openai";
import {
  analyzeBodySchema,
  contentAdvisorySchema,
  movieAnalysisSchema,
  reviewSentimentSchema,
  type SchemaName,
} from "@/lib/schemas";
import { validateRequest } from "@/lib/validate-api";

async function analyzeWithSchema(text: string, schemaName: SchemaName) {
  const prompt = `Analyze the following text and extract structured information:\n\n${text}`;

  switch (schemaName) {
    case "Movie Analysis": {
      const { output, usage } = await generateText({
        model: getModel(),
        output: Output.object({ schema: movieAnalysisSchema }),
        prompt,
      });
      return { output, usage };
    }
    case "Review Sentiment": {
      const { output, usage } = await generateText({
        model: getModel(),
        output: Output.object({ schema: reviewSentimentSchema }),
        prompt,
      });
      return { output, usage };
    }
    case "Content Advisory": {
      const { output, usage } = await generateText({
        model: getModel(),
        output: Output.object({ schema: contentAdvisorySchema }),
        prompt,
      });
      return { output, usage };
    }
  }
}

export const POST = validateRequest(
  analyzeBodySchema,
  async ({ text, schemaName }) => {
    try {
      const result = await analyzeWithSchema(text, schemaName);
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
