import { generateText, Output } from "ai";
import { getModel } from "@/lib/openai";
import {
  movieAnalysisSchema,
  reviewSentimentSchema,
  contentAdvisorySchema,
  type SchemaName,
} from "@/lib/schemas";

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

export async function POST(req: Request) {
  const { text, schemaName } = (await req.json()) as {
    text: string;
    schemaName: SchemaName;
  };

  const validNames: SchemaName[] = [
    "Movie Analysis",
    "Review Sentiment",
    "Content Advisory",
  ];

  if (!text || !schemaName || !validNames.includes(schemaName)) {
    return Response.json(
      { error: "text and valid schemaName are required" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeWithSchema(text, schemaName);
    return Response.json(result);
  } catch (error) {
    console.error("Structured output error:", error);
    return Response.json(
      { error: "Failed to generate structured output" },
      { status: 500 }
    );
  }
}
