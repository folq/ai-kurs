import { streamObject } from "ai";
import { analyzeBodySchema, schemas, type SchemaName } from "@/lib/schemas";
import { getModel } from "@/lib/openai";
import { validateRequest } from "@/lib/validate-api";

export const POST = validateRequest(
  analyzeBodySchema,
  async ({ text, schemaName, modelId }) => {
    const schemaEntry = schemas[schemaName as SchemaName];
    if (!schemaEntry) {
      return Response.json({ error: "Unknown schema" }, { status: 400 });
    }

    const prompt = `Analyze the following text and extract structured information:\n\n${text}`;

    const result = streamObject({
      model: getModel(modelId),
      schema: schemaEntry.schema,
      prompt,
      experimental_telemetry: { isEnabled: true },
    });

    return result.toTextStreamResponse();
  },
);
