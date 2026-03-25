import { convertToModelMessages, streamText } from "ai";
import { promptingChatBodySchema } from "@/lib/chat-api-schemas";
import { DEFAULT_LANGUAGE_MODEL } from "@/lib/model-selectors";
import { getModel } from "@/lib/openai";
import { validateRequest } from "@/lib/validate-api";

const defaultSystemPrompt = `You are a knowledgeable movie and TV show recommendation assistant. 
You help users discover new content based on their preferences, moods, and interests.
Be conversational, enthusiastic about great content, and provide specific reasons for your recommendations.
When recommending, mention the genre, year, and a brief reason why the user might enjoy it.`;

export const POST = validateRequest(
  promptingChatBodySchema,
  async ({ messages, systemPrompt, temperature, maxTokens, modelId }) => {
    const result = streamText({
      model: getModel(modelId ?? DEFAULT_LANGUAGE_MODEL),
      system: systemPrompt || defaultSystemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: temperature ?? 0.7,
      maxOutputTokens: maxTokens ?? 1024,
    });

    return result.toUIMessageStreamResponse();
  },
);
