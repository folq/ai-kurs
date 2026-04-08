import type { LanguageModelUsage } from "ai";

/** Shape expected by `UsageStats` and structured-outputs UI. */
export type ClientUsageStats = {
  promptTokens: number;
  completionTokens: number;
  reasoningTokens?: number;
};

export function normalizeLanguageModelUsage(
  usage: LanguageModelUsage | undefined,
): ClientUsageStats | null {
  if (!usage) return null;
  const promptTokens = usage.inputTokens ?? 0;
  const completionTokens = usage.outputTokens ?? 0;
  const reasoningTokens =
    usage.outputTokenDetails?.reasoningTokens ?? usage.reasoningTokens;
  return {
    promptTokens,
    completionTokens,
    reasoningTokens:
      reasoningTokens != null && reasoningTokens > 0
        ? reasoningTokens
        : undefined,
  };
}
