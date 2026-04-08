import type { LanguageModelUsage, UIMessage } from "ai";
import { z } from "zod";
import {
  DEFAULT_LANGUAGE_MODEL,
  type LanguageModelId,
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

/** Metadata shape sent from chat/agent routes via `messageMetadata`. */
export type ChatMessageMetadata = {
  usage?: LanguageModelUsage;
  /** Model that produced this assistant message (for usage/cost display). */
  modelId?: LanguageModelId;
};

/** `UIMessage` parameterised with our metadata so `.metadata` is typed. */
export type ChatUIMessage = UIMessage<ChatMessageMetadata>;

export const agentChatBodySchema = z.object({
  messages: z.array(uiMessageSchema),
  modelId: languageModelSelectorSchema
    .optional()
    .default(DEFAULT_LANGUAGE_MODEL),
  toolDescriptions: z.record(z.string(), z.string()).optional(),
});

export const promptingChatBodySchema = z.object({
  messages: z.array(uiMessageSchema),
  systemPrompt: z.string().optional(),
  temperature: z.number().optional(),
  /** 0 = omit cap; use provider default. Omitted field defaults to 1024 in the API. */
  maxTokens: z.number().int().min(0).optional(),
  modelId: languageModelSelectorSchema
    .optional()
    .default(DEFAULT_LANGUAGE_MODEL),
});

export const compareBodSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  modelIds: z.array(languageModelSelectorSchema).min(2).max(4),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().nullable(),
});

export const judgeBodSchema = z.object({
  prompt: z.string().min(1),
  responses: z
    .array(
      z.object({
        modelId: z.string(),
        text: z.string(),
      }),
    )
    .min(2),
  judgeModelId: languageModelSelectorSchema,
});
