import { z } from "zod";

export const LANGUAGE_MODEL_OPTIONS = [
  // Powerful flagship models
  { id: "anthropic/claude-opus-4.6", label: "Claude Opus 4.6" },
  { id: "openai/gpt-5.4", label: "GPT-5.4" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },

  // Strong mid-tier models
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },

  // Lightweight / fast models
  { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },

  // Reasoning-only models — no function calling / tool use
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1 (no tools)" },
  { id: "deepseek/deepseek-v3.2-speciale", label: "DeepSeek V3.2 Speciale (no tools)" },
] as const;

export const EMBEDDING_MODEL_OPTIONS = [
  {
    id: "openai/text-embedding-3-small",
    label: "text-embedding-3-small",
  },
] as const;

const LANGUAGE_MODEL_IDS = LANGUAGE_MODEL_OPTIONS.map(
  (option) => option.id,
) as [
  (typeof LANGUAGE_MODEL_OPTIONS)[number]["id"],
  ...(typeof LANGUAGE_MODEL_OPTIONS)[number]["id"][],
];

const EMBEDDING_MODEL_IDS = EMBEDDING_MODEL_OPTIONS.map(
  (option) => option.id,
) as [
  (typeof EMBEDDING_MODEL_OPTIONS)[number]["id"],
  ...(typeof EMBEDDING_MODEL_OPTIONS)[number]["id"][],
];

export const languageModelSelectorSchema = z.enum(LANGUAGE_MODEL_IDS);
export const embeddingModelSelectorSchema = z.enum(EMBEDDING_MODEL_IDS);

export type LanguageModelId = z.infer<typeof languageModelSelectorSchema>;
export type EmbeddingModelId = z.infer<typeof embeddingModelSelectorSchema>;

export const DEFAULT_LANGUAGE_MODEL: LanguageModelId = "openai/gpt-4o-mini";
export const DEFAULT_EMBEDDING_MODEL: EmbeddingModelId =
  "openai/text-embedding-3-small";
