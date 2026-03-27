import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_LANGUAGE_MODEL,
  LANGUAGE_MODEL_OPTIONS,
  type LanguageModelId,
  getModelLabel,
} from "@/lib/model-selectors";

interface JudgePanelProps {
  originalPrompt: string;
  responses: Array<{ modelId: string; text: string }>;
}

type JudgeResult = {
  verdict: string;
  rankings: Array<{ modelId: string; rank: number; reasoning: string }>;
};

export function JudgePanel({ originalPrompt, responses }: JudgePanelProps) {
  const [judgeModelId, setJudgeModelId] = useState<LanguageModelId>(
    DEFAULT_LANGUAGE_MODEL,
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runJudge = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

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
        setError(data.error);
        return;
      }
      setResult(data);
    } catch {
      setError("Failed to run judge");
    } finally {
      setLoading(false);
    }
  };

  if (responses.length < 2) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Judge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select
              value={judgeModelId}
              onValueChange={(v) => setJudgeModelId(v as LanguageModelId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select judge model" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={runJudge} disabled={loading}>
            {loading ? "Judging..." : "Run Judge"}
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
                  Rankings
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
