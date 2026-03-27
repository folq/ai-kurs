import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_LANGUAGE_MODEL,
  LANGUAGE_MODEL_OPTIONS,
  type LanguageModelId,
} from "@/lib/model-selectors";

const SCHEMAS = {
  "Movie Analysis": {
    description: "Extract structured details from a movie or show description",
    exampleInput:
      "A lonely writer in near-future Los Angeles develops a relationship with an AI operating system. The film explores themes of love, loneliness, and what it means to be human in an increasingly digital world. It has beautiful cinematography and a melancholic soundtrack.",
    zodCode: `z.object({
  title: z.string(),
  genres: z.array(z.string()),
  themes: z.array(z.string()),
  mood: z.enum(["dark", "light", "mixed", "intense", "whimsical"]),
  targetAudience: z.string(),
  similarTo: z.array(z.string()),
  summary: z.string(),
  rating: z.number().min(1).max(10),
})`,
  },
  "Review Sentiment": {
    description: "Analyze sentiment and key points from a review",
    exampleInput:
      "This show started incredibly strong with gripping performances and a tense atmosphere. However, by season 3, the writing became predictable and the characters lost their depth. The cinematography remained stunning throughout, but the plot holes became too large to ignore. Worth watching the first two seasons at least.",
    zodCode: `z.object({
  sentiment: z.enum(["very_positive", "positive", "mixed", "negative", "very_negative"]),
  score: z.number().min(0).max(100),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  keyQuotes: z.array(z.string()),
  recommendedFor: z.string(),
})`,
  },
  "Content Advisory": {
    description: "Generate content warnings and age ratings",
    exampleInput:
      "An intense crime drama featuring graphic violence, drug use, and strong language throughout. The show depicts realistic portrayals of murder and torture. Some episodes deal with themes of mental illness and suicide. Not suitable for younger viewers.",
    zodCode: `z.object({
  ageRating: z.enum(["G", "PG", "PG-13", "R", "NC-17"]),
  violence: z.enum(["none", "mild", "moderate", "strong", "extreme"]),
  language: z.enum(["none", "mild", "moderate", "strong"]),
  themes: z.array(z.string()),
  suitableForChildren: z.boolean(),
  parentalGuidanceNote: z.string(),
})`,
  },
};

type SchemaName = keyof typeof SCHEMAS;

export default function StructuredOutputsPage() {
  const [schemaName, setSchemaName] = useState<SchemaName>("Movie Analysis");
  const [modelId, setModelId] = useState<LanguageModelId>(
    DEFAULT_LANGUAGE_MODEL,
  );
  const [inputText, setInputText] = useState(
    SCHEMAS["Movie Analysis"].exampleInput,
  );
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [usage, setUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
  } | null>(null);

  const handleSchemaChange = (name: string) => {
    const schema = SCHEMAS[name as SchemaName];
    setSchemaName(name as SchemaName);
    setInputText(schema.exampleInput);
    setOutput(null);
    setRawJson("");
    setUsage(null);
  };

  const analyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch("/api/structured-outputs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, schemaName, modelId }),
      });
      const data = await res.json();
      if (data.error) {
        console.error(data.error);
        return;
      }
      setOutput(data.output);
      setRawJson(JSON.stringify(data.output, null, 2));
      setUsage(data.usage);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentSchema = SCHEMAS[schemaName];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">2. Structured Outputs</h1>
        <p className="text-muted-foreground max-w-2xl">
          Use Zod schemas to extract <strong>structured, typed JSON</strong>{" "}
          from free-form text. The LLM is constrained to output data that
          matches the schema exactly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Model</Label>
                <Select
                  value={modelId}
                  onValueChange={(v) => setModelId(v as LanguageModelId)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
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
              <div>
                <Label className="text-sm">Select Schema</Label>
                <Select
                  value={schemaName}
                  onValueChange={(v) => v && handleSchemaChange(v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SCHEMAS).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentSchema.description}
              </p>
              <div>
                <Label className="text-sm">Zod Schema Definition</Label>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                  {currentSchema.zodCode}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Input Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                placeholder="Paste a movie description, review, or any text to analyze..."
                className="text-sm"
              />
              <Button
                onClick={analyze}
                disabled={loading || !inputText.trim()}
                className="w-full"
              >
                {loading ? "Analyzing..." : "Extract Structured Data"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Output</CardTitle>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setShowRaw(!showRaw)}
                  >
                    {showRaw ? "Formatted" : "Raw JSON"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!output && !loading && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Run the extraction to see structured output here.
                </p>
              )}
              {loading && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Extracting structured data...
                </p>
              )}
              {output && !showRaw && (
                <div className="space-y-3">
                  {Object.entries(output).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <div className="mt-0.5">
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-1">
                            {value.map((v) => (
                              <Badge
                                key={`${key}-${String(v)}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {String(v)}
                              </Badge>
                            ))}
                          </div>
                        ) : typeof value === "boolean" ? (
                          <Badge
                            variant={value ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {value ? "Yes" : "No"}
                          </Badge>
                        ) : typeof value === "number" ? (
                          <span className="text-sm font-mono font-medium">
                            {value}
                          </span>
                        ) : (
                          <p className="text-sm">{String(value)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {output && showRaw && (
                <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto whitespace-pre max-h-[400px] overflow-y-auto">
                  {rawJson}
                </pre>
              )}
              {usage && (
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                  Tokens: {usage.promptTokens} prompt + {usage.completionTokens}{" "}
                  completion
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
