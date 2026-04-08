import { useState } from "react";
import { LanguageModelSelect } from "@/components/shared/LanguageModelSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_LANGUAGE_MODEL,
  getModelLabel,
  type LanguageModelId,
} from "@/lib/model-selectors";
import { cn } from "@/lib/utils";

export type JudgeResult = {
  verdict: string;
  rankings: Array<{ modelId: string; rank: number; reasoning: string }>;
};

interface JudgePanelProps {
  originalPrompt: string;
  responses: Array<{ modelId: string; text: string }>;
  disabled?: boolean;
  disabledReason?: string;
  result: JudgeResult | null;
  error: string | null;
  loading: boolean;
  onResultChange: (value: JudgeResult | null) => void;
  onErrorChange: (value: string | null) => void;
  onLoadingChange: (value: boolean) => void;
}

export function JudgePanel({
  originalPrompt,
  responses,
  disabled = false,
  disabledReason,
  result,
  error,
  loading,
  onResultChange,
  onErrorChange,
  onLoadingChange,
}: JudgePanelProps) {
  const [judgeModelId, setJudgeModelId] = useState<LanguageModelId>(
    DEFAULT_LANGUAGE_MODEL,
  );

  const runJudge = async () => {
    if (disabled || responses.length < 2) return;
    onLoadingChange(true);
    onErrorChange(null);
    onResultChange(null);

    try {
      const res = await fetch("/api/prompting/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: originalPrompt,
          responses,
          judgeModelId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        onErrorChange(data.error);
        return;
      }
      onResultChange(data);
    } catch {
      onErrorChange("Kunne ikke kjøre judge");
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <Card
      className={cn(disabled && "opacity-60")}
      title={disabled ? disabledReason : undefined}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Judge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <LanguageModelSelect
              value={judgeModelId}
              onValueChange={setJudgeModelId}
              disabled={disabled}
              placeholder="Velg judge-modell"
              triggerClassName="w-full"
            />
          </div>
          <Button onClick={runJudge} disabled={loading || disabled}>
            {loading ? "Vurderer..." : "Kjør judge"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{result.verdict}</p>
            </div>
            {result.rankings && result.rankings.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Rangering
                </p>
                {result.rankings
                  .sort((a, b) => a.rank - b.rank)
                  .map((r) => (
                    <div
                      key={r.modelId}
                      className="flex items-start gap-2 p-2 rounded-md bg-card border border-border"
                    >
                      <Badge
                        variant={r.rank === 1 ? "default" : "outline"}
                        className="text-xs shrink-0"
                      >
                        #{r.rank}
                      </Badge>
                      <div>
                        <span className="text-sm font-medium">
                          {getModelLabel(r.modelId)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.reasoning}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
