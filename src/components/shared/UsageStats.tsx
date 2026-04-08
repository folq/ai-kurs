import { ArrowDownToLine, ArrowUpFromLine, Brain } from "lucide-react";
import {
  calculateCost,
  formatCostInNok,
  getModelLabel,
} from "@/lib/model-selectors";

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
  const costNok = formatCostInNok(
    calculateCost(modelId, promptTokens, completionTokens),
  );
  const label = getModelLabel(modelId);
  const reasoningDisplay = reasoningTokens != null ? reasoningTokens : "—";

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground flex-wrap">
      <span className="inline-flex items-center gap-1" title="Tokens input">
        <ArrowDownToLine
          className="size-3.5 shrink-0 text-muted-foreground/70"
          aria-hidden
        />
        {promptTokens}
      </span>
      <span className="inline-flex items-center gap-1" title="tokens output">
        <ArrowUpFromLine
          className="size-3.5 shrink-0 text-muted-foreground/70"
          aria-hidden
        />
        {completionTokens}
      </span>
      <span className="inline-flex items-center gap-1" title="reasoning tokens">
        <Brain
          className="size-3.5 shrink-0 text-muted-foreground/70"
          aria-hidden
        />
        {reasoningDisplay}
      </span>
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
      {costNok != null && (
        <span className="text-primary font-medium">{costNok}</span>
      )}
      <span className="ml-auto text-[10px] text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}
