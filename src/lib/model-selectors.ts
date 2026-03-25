import { z } from "zod";

export const LANGUAGE_MODEL_OPTIONS = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
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
