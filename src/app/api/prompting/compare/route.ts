import { generateText } from "ai";
import { compareBodSchema } from "@/lib/chat-api-schemas";
import { getModel } from "@/lib/openai";
import { validateRequest } from "@/lib/validate-api";

const defaultSystemPrompt = `You are a knowledgeable movie and TV show recommendation assistant.
You help users discover new content based on their preferences, moods, and interests.
Be conversational, enthusiastic about great content, and provide specific reasons for your recommendations.`;

export const POST = validateRequest(
  compareBodSchema,
  async ({ prompt, systemPrompt, modelIds, temperature, maxTokens }) => {
    const results = await Promise.all(
      modelIds.map(async (modelId) => {
        try {
          const { text, usage } = await generateText({
            model: getModel(modelId),
            system: systemPrompt || defaultSystemPrompt,
            prompt,
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens ?? 1024,
          });
          return {
            modelId,
            text,
            usage: {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
            },
            error: null,
          };
        } catch (error) {
          return {
            modelId,
            text: "",
            usage: { inputTokens: 0, outputTokens: 0 },
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return Response.json({ results });
  },
);
