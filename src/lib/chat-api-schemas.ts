import type { UIMessage } from "ai";
import { z } from "zod";

const uiMessageShape = z.looseObject({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(z.unknown()),
});

/** Structural check; `parts` are validated again when converting to model messages. */
export const uiMessageSchema: z.ZodType<UIMessage> = z.custom<UIMessage>(
  (val): val is UIMessage => uiMessageShape.safeParse(val).success,
);

export const agentChatBodySchema = z.object({
  messages: z.array(uiMessageSchema),
});

export const promptingChatBodySchema = z.object({
  messages: z.array(uiMessageSchema),
  systemPrompt: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
});
