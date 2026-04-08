import type { JSONObject } from "@ai-sdk/provider";

/**
 * Provider options to enable extended thinking/reasoning.
 * The Vercel AI Gateway translates these to provider-specific params.
 * Models that don't support thinking will simply ignore them.
 */
export function getThinkingProviderOptions(): Record<string, JSONObject> {
  return {
    anthropic: {
      thinking: { type: "enabled", budgetTokens: 10000 },
    },
    openai: {
      reasoningEffort: "medium",
    },
    google: {
      thinkingConfig: { thinkingBudget: 10000 },
    },
  };
}
