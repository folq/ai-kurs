import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ModelComparison } from "@/components/prompting/ModelComparison";
import { LanguageModelSelect } from "@/components/shared/LanguageModelSelect";
import { UsageStats } from "@/components/shared/UsageStats";
import { PromptingTasks } from "@/components/theory/PromptingTasks";
import { PromptingTheory } from "@/components/theory/PromptingTheory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { ChatUIMessage } from "@/lib/chat-api-schemas";
import {
  DEFAULT_LANGUAGE_MODEL,
  type LanguageModelId,
} from "@/lib/model-selectors";

const DEFAULT_SYSTEM_PROMPT = `Du er en kunnskapsrik assistent for film- og TV-serieanbefalinger. 
Du hjelper brukere med å oppdage nytt innhold basert på deres preferanser, humør og interesser.
Vær samtalevennlig, entusiastisk om godt innhold, og gi spesifikke grunner for anbefalingene dine.
Når du anbefaler, nevn sjanger, årstall og en kort grunn til hvorfor brukeren kan like det.`;

const PRESET_PROMPTS = {
  "Standard assistent": DEFAULT_SYSTEM_PROMPT,
  Filmkritiker: `Du er en anerkjent filmkritiker med tiårs erfaring. 
Du analyserer filmer og TV-serier med dyp innsikt i kinematografi, narrativ struktur og tematiske elementer.
Bruk sofistikert språk, men vær tilgjengelig. Referer til andre verk for sammenligning.
Vær ærlig — ikke alt er et mesterverk.`,
  "Spoilerfri guide": `Du er en spoilerfri film- og TV-serieguide.
ALDRI avslør plottvendinger, avslutninger eller store overraskelser.
Fokuser på premisset, tonen og hva som gjør hver anbefaling verdt å se.
Hvis en bruker spør om plottdetaljer som ville vært spoilere, avslå høflig.`,
  Sjangerekspert: `Du er en sjangerekspert som spesialiserer seg på å hjelpe folk med å utforske spesifikke sjangre.
Når brukere nevner en sjanger, gå i dybden — anbefal skjulte perler, forklar undersjangre, og spor utviklingen av den sjangeren.
Still alltid oppfølgingsspørsmål for å avgrense hva brukeren ser etter innenfor en sjanger.`,
};

export default function PromptingPage() {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [modelId, setModelId] = useState<LanguageModelId>(
    DEFAULT_LANGUAGE_MODEL,
  );
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [input, setInput] = useState("");
  const [workshopTab, setWorkshopTab] = useState<"chat" | "comparison">("chat");
  const [streamStats, setStreamStats] = useState<
    Map<
      string,
      {
        promptTokens: number;
        completionTokens: number;
        tokensPerSecond: number;
        reasoningTokens?: number;
      }
    >
  >(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamStartRef = useRef<number | null>(null);
  const paramsRef = useRef({ modelId, systemPrompt, temperature, maxTokens });
  paramsRef.current = { modelId, systemPrompt, temperature, maxTokens };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/prompting/chat",
        body: () => paramsRef.current,
      }),
    [],
  );

  const { messages, sendMessage, status, setMessages } = useChat<ChatUIMessage>(
    {
      transport,
      onFinish: ({ message }) => {
        const usage = message.metadata?.usage;
        const startTime = streamStartRef.current;
        streamStartRef.current = null;
        const input = usage?.inputTokens ?? 0;
        const output = usage?.outputTokens ?? 0;
        if (usage && startTime) {
          const elapsed = (Date.now() - startTime) / 1000;
          const tokPerSec = elapsed > 0 ? output / elapsed : 0;
          setStreamStats((prev) => {
            const next = new Map(prev);
            next.set(message.id, {
              promptTokens: input,
              completionTokens: output,
              tokensPerSecond: tokPerSec,
              reasoningTokens: usage.reasoningTokens,
            });
            return next;
          });
        }
      },
    },
  );

  const isActive = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "streaming" && streamStartRef.current === null) {
      streamStartRef.current = Date.now();
    }
  }, [status]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when transcript or usage row changes height
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isActive) return;
    sendMessage({ text: input });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <PageShell
      title="1. Prompting"
      description="Eksperimenter med systemprompter og parametere for å se hvordan de påvirker AI-ens svar."
      theory={<PromptingTheory />}
      tasks={<PromptingTasks />}
    >
      <div className="mb-6 flex gap-0 border-b border-border">
        <button
          type="button"
          onClick={() => setWorkshopTab("chat")}
          className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
            workshopTab === "chat"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setWorkshopTab("comparison")}
          className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
            workshopTab === "comparison"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Modellsammenligning
        </button>
      </div>

      {workshopTab === "comparison" ? (
        <ModelComparison
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          presetPrompts={PRESET_PROMPTS}
          temperature={temperature}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modell</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <LanguageModelSelect
                    value={modelId}
                    onValueChange={setModelId}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Systemprompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(PRESET_PROMPTS).map(([name, prompt]) => (
                    <Button
                      key={name}
                      variant={systemPrompt === prompt ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setSystemPrompt(prompt)}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={10}
                  className="text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Systemprompten setter AI-ens rolle og oppførsel. Endringer
                  gjelder fra neste melding du sender.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Parametere</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Temperatur</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {temperature.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(v) =>
                      setTemperature(Array.isArray(v) ? v[0] : v)
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lav = deterministisk og fokusert. Høy = kreativ og variert.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Maks tokens</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {maxTokens === 0 ? "Standard" : maxTokens}
                    </span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={(v) =>
                      setMaxTokens(Array.isArray(v) ? v[0] : v)
                    }
                    min={0}
                    max={4096}
                    step={64}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMessages([])}
            >
              Tøm samtale
            </Button>
          </div>

          <Card className="flex flex-col h-[calc(100vh-220px)]">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-base">Chat</CardTitle>
            </CardHeader>
            <Separator />
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Start en samtale om filmer eller TV-serier...
                  </p>
                )}
                {messages.map((message) => {
                  const assistantStats =
                    message.role === "assistant"
                      ? streamStats.get(message.id)
                      : undefined;
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.parts.map((part, i) => {
                          if (part.type === "text") {
                            const textPartKey = `${message.id}-text-${i}`;
                            return (
                              <div
                                key={textPartKey}
                                className="whitespace-pre-wrap"
                              >
                                {part.text}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                      {assistantStats != null && (
                        <div className="mt-1 max-w-[80%]">
                          <UsageStats
                            promptTokens={assistantStats.promptTokens}
                            completionTokens={assistantStats.completionTokens}
                            tokensPerSecond={assistantStats.tokensPerSecond}
                            reasoningTokens={assistantStats.reasoningTokens}
                            modelId={
                              message.metadata?.modelId ??
                              DEFAULT_LANGUAGE_MODEL
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {isActive && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground">
                      Tenker...
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Separator />
            <form onSubmit={handleSubmit} className="p-4 flex gap-2 shrink-0">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Spør om filmanbefalinger..."
                autoFocus
              />
              <Button type="submit" disabled={isActive || !input.trim()}>
                Send
              </Button>
            </form>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
