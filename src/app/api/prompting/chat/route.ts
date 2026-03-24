import { streamText, convertToModelMessages } from "ai";
import { getModel } from "@/lib/openai";
import { promptingChatBodySchema } from "@/lib/chat-api-schemas";
import { validateRequest } from "@/lib/validate-api";

const defaultSystemPrompt = `You are a knowledgeable movie and TV show recommendation assistant. 
You help users discover new content based on their preferences, moods, and interests.
Be conversational, enthusiastic about great content, and provide specific reasons for your recommendations.
When recommending, mention the genre, year, and a brief reason why the user might enjoy it.`;

export const POST = validateRequest(
  promptingChatBodySchema,
  async ({ messages, systemPrompt, temperature, maxTokens }) => {
    const result = streamText({
      model: getModel(),
      system: systemPrompt || defaultSystemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: temperature ?? 0.7,
      maxOutputTokens: maxTokens ?? 1024,
    });

    return result.toUIMessageStreamResponse();
  }
);
