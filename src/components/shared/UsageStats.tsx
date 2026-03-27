import { calculateCost, getModelLabel } from "@/lib/model-selectors";

interface UsageStatsProps {
  promptTokens: number;
  completionTokens: number;
  modelId: string;
  tokensPerSecond?: number;
  durationMs?: number;
  reasoningTokens?: number;
}

export function UsageStats({
  promptTokens,
  completionTokens,
  modelId,
  tokensPerSecond,
  durationMs,
  reasoningTokens,
}: UsageStatsProps) {
  const cost = calculateCost(modelId, promptTokens, completionTokens);
  const label = getModelLabel(modelId);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground flex-wrap">
      <span>
        <span className="text-muted-foreground/60">↑</span> {promptTokens} in
      </span>
      <span>
        <span className="text-muted-foreground/60">↓</span> {completionTokens}{" "}
        out
      </span>
      {reasoningTokens != null && reasoningTokens > 0 && (
        <span>
          <span className="text-muted-foreground/60">💭</span> {reasoningTokens}{" "}
          reasoning
        </span>
      )}
      <span className="w-px h-3.5 bg-border" />
      {tokensPerSecond != null && (
        <span>
          <span className="text-muted-foreground/60">⚡</span>{" "}
          {tokensPerSecond.toFixed(1)} tok/s
        </span>
      )}
      {durationMs != null && tokensPerSecond == null && (
        <span>
          <span className="text-muted-foreground/60">⏱</span>{" "}
          {(durationMs / 1000).toFixed(1)}s
        </span>
      )}
      {(tokensPerSecond != null || durationMs != null) && (
        <span className="w-px h-3.5 bg-border" />
      )}
      {cost != null && (
        <span className="text-primary font-medium">
          ${cost < 0.0001 ? cost.toExponential(1) : cost.toFixed(4)}
        </span>
      )}
      <span className="ml-auto text-[10px] text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}
