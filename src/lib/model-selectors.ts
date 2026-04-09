import { z } from "zod";

/**
 * Catalog of chat models. Each entry has a `tier`: lower = smaller / faster /
 * cheaper within the same provider; higher = larger / more capable.
 */
export const LANGUAGE_MODEL_OPTIONS = [
  { id: "anthropic/claude-opus-4.6", label: "Claude Opus 4.6", tier: 3 },
  { id: "openai/gpt-5.4", label: "GPT-5.4", tier: 3 },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", tier: 3 },

  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6", tier: 2 },
  { id: "openai/gpt-4o", label: "GPT-4o", tier: 2 },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", tier: 2 },

  { id: "openai/gpt-4o-mini", label: "GPT-4o mini", tier: 1 },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5", tier: 1 },
  {
    id: "google/gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    tier: 1,
  },
  {
    id: "deepseek/deepseek-v3.2",
    label: "DeepSeek V3.2 Speciale",
    tier: 1,
  },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1 (no tools)", tier: 2 },
] as const;

export type LanguageModelOption = (typeof LANGUAGE_MODEL_OPTIONS)[number];

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  google: "Google",
  openai: "OpenAI",
};

export type LanguageModelProviderGroup = {
  providerId: string;
  providerLabel: string;
  models: LanguageModelOption[];
};

/** Groups models by provider; providers A–Z, models smallest tier first within each. */
export function getLanguageModelGroups(): LanguageModelProviderGroup[] {
  const byProvider = new Map<string, LanguageModelOption[]>();
  for (const opt of LANGUAGE_MODEL_OPTIONS) {
    const providerId = opt.id.split("/")[0] ?? opt.id;
    const list = byProvider.get(providerId);
    if (list) list.push(opt);
    else byProvider.set(providerId, [opt]);
  }
  const providerIds = [...byProvider.keys()].sort((a, b) => a.localeCompare(b));
  return providerIds.map((providerId) => {
    const models = [...(byProvider.get(providerId) ?? [])].sort(
      (a, b) => a.tier - b.tier,
    );
    return {
      providerId,
      providerLabel: PROVIDER_LABELS[providerId] ?? providerId,
      models,
    };
  });
}

/** Cached grouping for UI lists (same order as `getLanguageModelGroups()`). */
export const LANGUAGE_MODEL_GROUPS: LanguageModelProviderGroup[] =
  getLanguageModelGroups();

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

export const DEFAULT_LANGUAGE_MODEL: LanguageModelId =
  "anthropic/claude-haiku-4.5";
export const DEFAULT_EMBEDDING_MODEL: EmbeddingModelId =
  "openai/text-embedding-3-small";

export const MODEL_PRICING: Partial<
  Record<LanguageModelId, { input: number; output: number }>
> = {
  "anthropic/claude-opus-4.6": { input: 15.0, output: 75.0 },
  "openai/gpt-5.4": { input: 10.0, output: 30.0 },
  "google/gemini-3.1-pro-preview": { input: 1.25, output: 5.0 },
  "anthropic/claude-sonnet-4.6": { input: 3.0, output: 15.0 },
  "openai/gpt-4o": { input: 2.5, output: 10.0 },
  "google/gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.6 },
  "anthropic/claude-haiku-4.5": { input: 0.8, output: 4.0 },
  "google/gemini-2.5-flash-lite": { input: 0.075, output: 0.3 },
  "deepseek/deepseek-r1": { input: 0.55, output: 2.19 },
  "deepseek/deepseek-v3.2": { input: 0.28, output: 0.42 },
};

/**
 * Estimates USD cost from token counts.
 *
 * Pass through the same numbers as AI SDK `LanguageModelUsage` after
 * normalization (`asLanguageModelUsage` in `ai`): **`outputTokens` is already the
 * total output count** (the provider’s `outputTokens.total`). Top-level
 * **`reasoningTokens`** and **`outputTokenDetails.reasoningTokens`** are a
 * **breakdown slice** of that total — do not add them again for pricing or you
 * double-count.
 *
 * @see https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-text (usage / LanguageModelUsage)
 */
export function calculateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const pricing = MODEL_PRICING[modelId as LanguageModelId];
  if (!pricing) return null;
  return (
    (promptTokens * pricing.input + completionTokens * pricing.output) /
    1_000_000
  );
}

/** USD → NOK multiplier for displaying usage cost (approximate). */
export const USD_TO_NOK_RATE = 9.58;

/** Formats a USD cost from `calculateCost` as Norwegian kroner for UI. */
export function formatCostInNok(usdCost: number | null): string | null {
  if (usdCost == null) return null;
  const nok = usdCost * USD_TO_NOK_RATE;
  if (nok > 0 && nok < 0.001) {
    return `${nok.toExponential(1)} kr`;
  }
  return `${new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(nok)}\u00A0kr`;
}

export function getModelLabel(modelId: string): string {
  const option = LANGUAGE_MODEL_OPTIONS.find((o) => o.id === modelId);
  return option?.label ?? modelId;
}
