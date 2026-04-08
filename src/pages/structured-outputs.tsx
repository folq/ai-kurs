import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { UsageStats } from "@/components/shared/UsageStats";
import { StructuredOutputsTheory } from "@/components/theory/StructuredOutputsTheory";
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
import { prepareModelJsonText } from "@/lib/thinking-json";

type StructuredOutputErrorJson = {
  error?: string;
  thinking?: string[];
  modelOutput?: string;
  validationMessage?: string;
};

function formatFieldKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").trim();
}

function StructuredValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <p className="text-sm text-muted-foreground">—</p>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-muted-foreground">—</p>;
    }
    const primitivesOnly = value.every(
      (v) => v === null || v === undefined || typeof v !== "object",
    );
    if (primitivesOnly) {
      const counts = new Map<string, number>();
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v) => {
            const base = String(v);
            const n = counts.get(base) ?? 0;
            counts.set(base, n + 1);
            const key = n === 0 ? base : `${base}__${n}`;
            return (
              <Badge key={key} variant="secondary" className="text-xs">
                {String(v)}
              </Badge>
            );
          })}
        </div>
      );
    }
    return (
      <ul className="list-disc pl-4 space-y-2 text-sm">
        {value.map((v) => (
          <li
            key={
              typeof v === "object" && v !== null
                ? JSON.stringify(v)
                : String(v)
            }
          >
            <StructuredValue value={v} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="mt-1 rounded-md border bg-muted/30 p-2 space-y-3">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              {formatFieldKey(k)}
            </Label>
            <div className="mt-0.5">
              <StructuredValue value={v} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "destructive"} className="text-xs">
        {value ? "Ja" : "Nei"}
      </Badge>
    );
  }
  if (typeof value === "number") {
    return <span className="text-sm font-mono font-medium">{value}</span>;
  }
  return <p className="text-sm">{String(value)}</p>;
}

const SCHEMAS = {
  Filmanalyse: {
    description:
      "Hent ut strukturerte detaljer fra en film- eller seriebeskrivelse",
    exampleInput:
      "En ensom forfatter i et nær-fremtidig Los Angeles utvikler et forhold til et AI-operativsystem. Filmen utforsker temaer som kjærlighet, ensomhet og hva det betyr å være menneske i en stadig mer digital verden. Den har vakker kinematografi og et melankolsk lydspor.",
    zodCode: `z.object({
  title: z.string(),
  genres: z.array(z.string()),
  themes: z.array(z.string()),
  mood: z.enum([
    "dark",
    "light",
    "mixed",
    "intense",
    "whimsical",
    "melancholic",
  ]),
  targetAudience: z.string(),
  similarTo: z.array(z.string()),
  summary: z.string(),
  rating: z.number().min(1).max(10),
})`,
  },
  Sentimentanalyse: {
    description: "Analyser sentiment og nøkkelpunkter fra en anmeldelse",
    exampleInput:
      "Denne serien startet utrolig sterkt med gripende skuespill og en spent atmosfære. Men innen sesong 3 ble manuset forutsigbart og karakterene mistet dybden sin. Kinematografien forble imponerende gjennomgående, men plottehullene ble for store til å ignorere. Verdt å se de to første sesongene i det minste.",
    zodCode: `z.object({
  sentiment: z.enum(["very_positive", "positive", "mixed", "negative", "very_negative"]),
  score: z.number().min(0).max(100),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  keyQuotes: z.array(z.string()),
  recommendedFor: z.string(),
})`,
  },
  Innholdsvarsel: {
    description: "Generer innholdsadvarsler og aldersgrenser",
    exampleInput:
      "Et intenst krimdrama med grafisk vold, narkotikabruk og sterkt språk gjennomgående. Serien viser realistiske skildringer av drap og tortur. Noen episoder tar opp temaer som psykisk sykdom og selvmord. Ikke egnet for yngre seere.",
    zodCode: `z.object({
  ageRating: z.enum(["G", "PG", "PG-13", "R", "NC-17"]),
  violence: z.enum(["none", "mild", "moderate", "strong", "extreme"]),
  language: z.enum(["none", "mild", "moderate", "strong"]),
  themes: z.array(z.string()),
  suitableForChildren: z.boolean(),
  parentalGuidanceNote: z.string(),
})`,
  },
  Innholdsklassifisering: {
    description:
      "Klassifiser input som anmeldelse, synopsis eller spørsmål med typespesifikke felt",
    exampleInput:
      "Hva bør jeg se hvis jeg likte Inception? Jeg er i humør for noe tankevridende med flott visuelt og et komplekst plott.",
    zodCode: `z.object({
  classification: z.union([
    z.object({
      type: z.literal("review"),
      sentiment: z.enum(["very_positive", "positive", "mixed", "negative", "very_negative"]),
      score: z.number().min(0).max(100),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    }),
    z.object({
      type: z.literal("synopsis"),
      title: z.string(),
      genre: z.string(),
      plotSummary: z.string(),
      characters: z.array(z.string()),
    }),
    z.object({
      type: z.literal("question"),
      topic: z.string(),
      intent: z.string(),
      suggestedAction: z.string(),
    }),
  ]),
})`,
  },
  "Versjonert analyse": {
    description:
      "Analyser med økende detaljnivå — v1 (enkel), v2 (detaljert), v3 (omfattende)",
    exampleInput:
      "En ensom forfatter i et nær-fremtidig Los Angeles utvikler et forhold til et AI-operativsystem. Filmen utforsker temaer som kjærlighet, ensomhet og hva det betyr å være menneske.",
    zodCode: `z.object({
  analysis: z.union([
    z.object({
      version: z.literal("1"),
      title: z.string(),
      rating: z.number().min(1).max(10),
    }),
    z.object({
      version: z.literal("2"),
      title: z.string(),
      rating: z.number().min(1).max(10),
      genres: z.array(z.string()),
      themes: z.array(z.string()),
      mood: z.enum(["dark", "light", "mixed", "intense", "whimsical", "melancholic"]),
    }),
    z.object({
      version: z.literal("3"),
      title: z.string(),
      rating: z.number().min(1).max(10),
      genres: z.array(z.string()),
      themes: z.array(z.string()),
      mood: z.enum(["dark", "light", "mixed", "intense", "whimsical", "melancholic"]),
      targetAudience: z.string(),
      contentWarnings: z.array(z.string()),
      similarTo: z.array(z.string()),
    }),
  ]),
})`,
  },
};

type SchemaName = keyof typeof SCHEMAS;

export default function StructuredOutputsPage() {
  const [schemaName, setSchemaName] = useState<SchemaName>("Filmanalyse");
  const [modelId, setModelId] = useState<LanguageModelId>(
    DEFAULT_LANGUAGE_MODEL,
  );
  const [inputText, setInputText] = useState(SCHEMAS.Filmanalyse.exampleInput);
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [usage, setUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
  } | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [mode, setMode] = useState<"full" | "streaming">("full");
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [debugModelText, setDebugModelText] = useState<string | null>(null);

  const handleSchemaChange = (name: string) => {
    const schema = SCHEMAS[name as SchemaName];
    setSchemaName(name as SchemaName);
    setInputText(schema.exampleInput);
    setOutput(null);
    setRawJson("");
    setUsage(null);
    setAnalyzeError(null);
    setThinkingSteps([]);
    setDebugModelText(null);
  };

  const analyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutput(null);
    setRawJson("");
    setDurationMs(null);
    setAnalyzeError(null);
    setThinkingSteps([]);
    setDebugModelText(null);

    try {
      const startTime = Date.now();

      if (mode === "streaming") {
        const res = await fetch("/api/structured-outputs/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText, schemaName, modelId }),
        });

        if (!res.ok) {
          let message = `Forespørsel feilet (${res.status})`;
          try {
            const err = (await res.json()) as StructuredOutputErrorJson;
            if (typeof err.error === "string" && err.error.trim()) {
              message = err.error;
            }
            if (Array.isArray(err.thinking) && err.thinking.length > 0) {
              setThinkingSteps(err.thinking);
            }
            if (typeof err.modelOutput === "string" && err.modelOutput.trim()) {
              setDebugModelText(err.modelOutput);
            }
          } catch {
            /* ignore */
          }
          setAnalyzeError(message);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setAnalyzeError("Ingen svarstrøm mottatt.");
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";
        let streamParsed: Record<string, unknown> | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setRawJson(accumulated);
          const { thinkingSegments, jsonCandidate } =
            prepareModelJsonText(accumulated);
          if (thinkingSegments.length > 0) {
            setThinkingSteps(thinkingSegments);
          }
          try {
            const parsed = JSON.parse(jsonCandidate) as Record<string, unknown>;
            streamParsed = parsed;
            setOutput(parsed);
          } catch {
            // partial JSON, keep accumulating
          }
        }

        setDurationMs(Date.now() - startTime);
        setUsage(null); // streaming may not return usage in text stream

        const finalPrep = prepareModelJsonText(accumulated);
        if (finalPrep.thinkingSegments.length > 0) {
          setThinkingSteps(finalPrep.thinkingSegments);
        }
        if (!streamParsed) {
          try {
            const parsed = JSON.parse(finalPrep.jsonCandidate) as Record<
              string,
              unknown
            >;
            setOutput(parsed);
            setRawJson(JSON.stringify(parsed, null, 2));
          } catch {
            if (accumulated.trim()) {
              setAnalyzeError(
                "Kunne ikke tolke ferdig strøm som JSON. Sjekk rå tekst under — tenkeblokker er forsøkt fjernet.",
              );
              setDebugModelText(finalPrep.jsonCandidate || accumulated);
            }
          }
        } else {
          setRawJson(JSON.stringify(streamParsed, null, 2));
        }
      } else {
        const res = await fetch("/api/structured-outputs/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText, schemaName, modelId }),
        });
        const data = (await res.json()) as StructuredOutputErrorJson & {
          output?: Record<string, unknown>;
          usage?: { promptTokens: number; completionTokens: number };
        };
        setDurationMs(Date.now() - startTime);
        if (!res.ok || data.error) {
          const message =
            typeof data.error === "string" && data.error.trim()
              ? data.error
              : `Forespørsel feilet (${res.status})`;
          setAnalyzeError(message);
          if (Array.isArray(data.thinking) && data.thinking.length > 0) {
            setThinkingSteps(data.thinking);
          }
          if (typeof data.modelOutput === "string" && data.modelOutput.trim()) {
            setDebugModelText(data.modelOutput);
          }
          return;
        }
        if (data.output === undefined) {
          setAnalyzeError("Uventet svar: mangler output.");
          return;
        }
        setOutput(data.output);
        setRawJson(JSON.stringify(data.output, null, 2));
        setUsage(data.usage ?? null);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nettverks- eller ukjent feil.";
      setAnalyzeError(message);
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentSchema = SCHEMAS[schemaName];

  return (
    <PageShell
      title="2. Structured Outputs"
      description="Bruk Zod-schemas for å hente ut strukturert, typet JSON fra fritekst."
      theory={<StructuredOutputsTheory />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Skjema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Modell</Label>
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
                <Label className="text-sm">Genereringsmodus</Label>
                <div className="flex gap-1 mt-1">
                  <Button
                    variant={mode === "full" ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => setMode("full")}
                  >
                    Komplett
                  </Button>
                  <Button
                    variant={mode === "streaming" ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => setMode("streaming")}
                  >
                    Strømming
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm">Velg skjema</Label>
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
                <Label className="text-sm">Zod-skjemadefinisjon</Label>
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
              <CardTitle className="text-base">Inntekst</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                placeholder="Lim inn en filmbeskrivelse, anmeldelse eller annen tekst å analysere..."
                className="text-sm"
              />
              <Button
                onClick={analyze}
                disabled={loading || !inputText.trim()}
                className="w-full"
              >
                {loading ? "Analyserer..." : "Hent ut strukturerte data"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Resultat</CardTitle>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setShowRaw(!showRaw)}
                  >
                    {showRaw ? "Formatert" : "Rå JSON"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {thinkingSteps.length > 0 && (
                <div className="rounded-lg border border-teal-600/25 bg-teal-500/5 px-3 py-2 space-y-2">
                  <Label className="text-xs text-teal-800 dark:text-teal-200 uppercase tracking-wide">
                    Modellens tenking / resonnering
                  </Label>
                  {thinkingSteps.map((step, i) => (
                    <pre
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable order from model
                      key={`think-${i}`}
                      className="text-xs font-mono whitespace-pre-wrap break-words text-foreground/90 max-h-48 overflow-y-auto"
                    >
                      {step}
                    </pre>
                  ))}
                </div>
              )}
              {analyzeError && !loading && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive whitespace-pre-wrap break-words"
                >
                  {analyzeError}
                </div>
              )}
              {analyzeError && debugModelText && !loading && (
                <details className="rounded-lg border border-foreground/15 bg-muted/40 px-3 py-2 text-sm">
                  <summary className="cursor-pointer text-muted-foreground select-none">
                    Rå modelltekst (etter fjerning av tenkeblokker)
                  </summary>
                  <pre className="mt-2 text-xs font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {debugModelText}
                  </pre>
                </details>
              )}
              {!output && !loading && !analyzeError && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Kjør utvinningen for å se strukturert resultat her.
                </p>
              )}
              {loading && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Henter ut strukturerte data...
                </p>
              )}
              {mode === "streaming" && rawJson && !output && (
                <pre className="p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto whitespace-pre max-h-[400px] overflow-y-auto">
                  {rawJson}
                </pre>
              )}
              {output && !showRaw && (
                <div className="space-y-3">
                  {Object.entries(output).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        {formatFieldKey(key)}
                      </Label>
                      <div className="mt-0.5">
                        <StructuredValue value={value} />
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
                <div className="mt-4 pt-3 border-t">
                  <UsageStats
                    promptTokens={usage.promptTokens}
                    completionTokens={usage.completionTokens}
                    modelId={modelId}
                    durationMs={durationMs ?? undefined}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
