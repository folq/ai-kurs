import { useState } from "react";
import { UsageStats } from "@/components/shared/UsageStats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  LANGUAGE_MODEL_OPTIONS,
  type LanguageModelId,
  getModelLabel,
} from "@/lib/model-selectors";
import { JudgePanel } from "./JudgePanel";

interface ModelComparisonProps {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

type CompareResult = {
  modelId: string;
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  error: string | null;
};

export function ModelComparison({
  systemPrompt,
  temperature,
  maxTokens,
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
          maxTokens,
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
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Model Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Select 2–4 models to compare (click to toggle):
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

        <Textarea
          value={comparePrompt}
          onChange={(e) => setComparePrompt(e.target.value)}
          placeholder="Enter the prompt to run on all selected models…"
          rows={3}
          className="text-sm"
        />

        <Button
          onClick={runComparison}
          disabled={
            loading || selectedModels.length < 2 || !comparePrompt.trim()
          }
          className="w-full"
        >
          {loading ? "Running comparison..." : "Run Comparison"}
        </Button>

        {results.length > 0 && (
          <>
            <div
              className={`grid gap-4 ${results.length === 2 ? "grid-cols-1 lg:grid-cols-2" : results.length === 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"}`}
            >
              {results.map((result) => (
                <Card key={result.modelId} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {getModelLabel(result.modelId)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    {result.error ? (
                      <p className="text-sm text-destructive">{result.error}</p>
                    ) : (
                      <>
                        <div className="text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                          {result.text}
                        </div>
                        <UsageStats
                          promptTokens={result.usage.inputTokens}
                          completionTokens={result.usage.outputTokens}
                          modelId={result.modelId}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <JudgePanel
              originalPrompt={comparePrompt}
              responses={results
                .filter((r) => !r.error)
                .map((r) => ({ modelId: r.modelId, text: r.text }))}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
