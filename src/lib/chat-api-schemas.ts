import type { UIMessage } from "ai";
import { z } from "zod";
import {
  DEFAULT_LANGUAGE_MODEL,
  languageModelSelectorSchema,
} from "@/lib/model-selectors";

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
  modelId: languageModelSelectorSchema
    .optional()
    .default(DEFAULT_LANGUAGE_MODEL),
});

export const promptingChatBodySchema = z.object({
  messages: z.array(uiMessageSchema),
  systemPrompt: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  modelId: languageModelSelectorSchema
    .optional()
    .default(DEFAULT_LANGUAGE_MODEL),
});
