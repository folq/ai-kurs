import { useState } from "react";
import { UsageStats } from "@/components/shared/UsageStats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getModelLabel,
  LANGUAGE_MODEL_OPTIONS,
  type LanguageModelId,
} from "@/lib/model-selectors";
import { JudgePanel } from "./JudgePanel";

interface ModelComparisonProps {
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  presetPrompts: Record<string, string>;
  temperature: number;
}

type CompareResult = {
  modelId: string;
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens?: number;
  };
  error: string | null;
};

export function ModelComparison({
  systemPrompt,
  onSystemPromptChange,
  presetPrompts,
  temperature,
}: ModelComparisonProps) {
  const [selectedModels, setSelectedModels] = useState<LanguageModelId[]>([]);
  const [comparePrompt, setComparePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompareResult[]>([]);

  const toggleModel = (modelId: LanguageModelId) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : prev.length < 4
          ? [...prev, modelId]
          : prev,
    );
  };

  const successfulResults = results.filter((r) => !r.error);
  const canRunJudge = successfulResults.length >= 2;
  const judgeDisabledReason =
    results.length === 0
      ? "Kjør en sammenligning først — judge trenger svar fra modellene."
      : !canRunJudge
        ? "Judge krever minst to vellykkede svar (uten feil)."
        : undefined;

  const runComparison = async () => {
    if (selectedModels.length < 2 || !comparePrompt.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("/api/prompting/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: comparePrompt,
          systemPrompt,
          modelIds: selectedModels,
          temperature,
          maxTokens: null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.error(data.error);
        return;
      }
      setResults(data.results);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Send samme prompt til flere modeller samtidig og sammenlign svarene side
        om side. Velg en systemprompt for å gi modellene en rolle, og se hvordan
        ulike modeller håndterer samme oppgave.
      </p>
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Velg 2–4 modeller å sammenligne
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_MODEL_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={
                selectedModels.includes(option.id) ? "default" : "outline"
              }
              size="sm"
              className="text-xs"
              onClick={() => toggleModel(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {selectedModels.length > 0 && (
          <div className="flex gap-1 mt-2">
            {selectedModels.map((id) => (
              <Badge key={id} variant="secondary" className="text-xs">
                {getModelLabel(id)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Systemprompt</Label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(presetPrompts).map(([name, prompt]) => (
            <Button
              key={name}
              variant={systemPrompt === prompt ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => onSystemPromptChange(prompt)}
            >
              {name}
            </Button>
          ))}
        </div>
        <Textarea
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          rows={6}
          className="text-sm font-mono"
        />
      </div>

      <Textarea
        value={comparePrompt}
        onChange={(e) => setComparePrompt(e.target.value)}
        placeholder="Skriv inn prompten som skal kjøres på alle valgte modeller…"
        rows={3}
        className="text-sm"
      />

      <Button
        onClick={runComparison}
        disabled={loading || selectedModels.length < 2 || !comparePrompt.trim()}
        className="w-full"
      >
        {loading ? "Kjører sammenligning..." : "Kjør sammenligning"}
      </Button>

      {results.length > 0 && (
        <div
          className={`grid gap-4 ${results.length === 2 ? "grid-cols-1 lg:grid-cols-2" : results.length === 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"}`}
        >
          {results.map((result) => (
            <Card key={result.modelId} className="flex flex-col min-h-[200px]">
              <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-sm">
                  {getModelLabel(result.modelId)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2 min-h-0 pt-0">
                {result.error ? (
                  <p className="text-sm text-destructive">{result.error}</p>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-wrap max-h-[300px] min-h-0 flex-1 overflow-y-auto">
                      {result.text}
                    </div>
                    <UsageStats
                      promptTokens={result.usage.inputTokens}
                      completionTokens={result.usage.outputTokens}
                      reasoningTokens={result.usage.reasoningTokens}
                      modelId={result.modelId}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JudgePanel
        originalPrompt={comparePrompt}
        responses={successfulResults.map((r) => ({
          modelId: r.modelId,
          text: r.text,
        }))}
        disabled={!canRunJudge}
        disabledReason={judgeDisabledReason}
      />
    </div>
  );
}
