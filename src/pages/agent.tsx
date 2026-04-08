import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getToolName, isToolUIPart } from "ai";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ModelResponseMarkdown } from "@/components/prompting/ModelResponseMarkdown";
import { LanguageModelSelect } from "@/components/shared/LanguageModelSelect";
import { UsageStats } from "@/components/shared/UsageStats";
import { AgentTheory } from "@/components/theory/AgentTheory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { ChatUIMessage } from "@/lib/chat-api-schemas";
import {
  DEFAULT_LANGUAGE_MODEL,
  type LanguageModelId,
} from "@/lib/model-selectors";

type FavoriteMovie = {
  id: number;
  title: string;
  year: number | null;
  genre: string;
  rating: number | null;
  note: string | null;
};

const TOOL_LABELS: Record<string, string> = {
  searchMovies: "Søker etter filmer",
  getMovieDetails: "Henter detaljer",
  addToFavorites: "Legger til i favoritter",
  removeFromFavorites: "Fjerner fra favoritter",
  getFavorites: "Henter favoritter",
  recommendSimilar: "Finner lignende",
};

function ToolCallCard({
  toolName,
  input,
  state,
  output,
  errorText,
}: {
  toolName: string;
  input: unknown;
  state: string;
  output?: unknown;
  errorText?: string;
}) {
  const [open, setOpen] = useState(false);

  const inputRecord =
    input != null && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : null;
  const inputSummary =
    inputRecord && Object.keys(inputRecord).length > 0
      ? Object.entries(inputRecord)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(", ")
      : input !== undefined
        ? JSON.stringify(input)
        : "";

  const resultBody =
    state === "output-available"
      ? JSON.stringify(output ?? null, null, 2)
      : state === "output-error"
        ? JSON.stringify({ error: errorText }, null, 2)
        : JSON.stringify({ state, input: input ?? null }, null, 2);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md bg-muted/50 border text-xs hover:bg-muted transition-colors">
        <Badge variant="outline" className="text-xs shrink-0">
          Verktøy
        </Badge>
        <span className="font-medium">{TOOL_LABELS[toolName] || toolName}</span>
        {inputSummary ? (
          <span className="text-muted-foreground truncate">
            ({inputSummary})
          </span>
        ) : null}
        <span className="ml-auto text-muted-foreground">
          {open ? "▲" : "▼"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
          <div className="text-muted-foreground mb-1">Resultat:</div>
          <pre className="whitespace-pre-wrap">{resultBody}</pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<LanguageModelId>(DEFAULT_LANGUAGE_MODEL);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
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
  const modelRef = useRef(model);
  modelRef.current = model;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent/chat",
        body: () => ({ modelId: modelRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, status } = useChat<ChatUIMessage>({
    transport,
    onFinish: ({ message }) => {
      const usage = message.metadata?.usage;
      const startTime = streamStartRef.current;
      streamStartRef.current = null;
      const input = usage?.inputTokens ?? 0;
      const output = usage?.outputTokens ?? 0;
      const textTokens = usage?.outputTokenDetails?.textTokens ?? output;
      if (usage && startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const tokPerSec = elapsed > 0 ? textTokens / elapsed : 0;
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
  });

  const isActive = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "streaming" && streamStartRef.current === null) {
      streamStartRef.current = Date.now();
    }
  }, [status]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when transcript or usage row changes height
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamStats]);

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      fetchFavorites();
    }
  }, [status, messages.length, fetchFavorites]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isActive) return;
    sendMessage({ text: input });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <PageShell
      title="4. Agent"
      description="En samtalende agent med verktøy som binder alt sammen."
      theory={<AgentTheory />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <Card className="flex flex-col h-[calc(100vh-220px)]">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">Agent-chat</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {Object.keys(TOOL_LABELS).length} verktøy tilgjengelig
              </Badge>
              <div className="ml-auto min-w-[220px]">
                <LanguageModelSelect
                  value={model}
                  onValueChange={setModel}
                  placeholder="Velg modell"
                />
              </div>
            </div>
          </CardHeader>
          <Separator />
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Prøv å be agenten finne filmer for deg!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Finn mørke sci-fi-filmer om AI",
                      "Hva er i favorittene mine?",
                      "Anbefal noe lignende som Inception",
                      "Finn feelgood-komedier og legg den beste til i favorittene mine",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          sendMessage({ text: suggestion });
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message) => {
                const assistantStats =
                  message.role === "assistant"
                    ? streamStats.get(message.id)
                    : undefined;
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%] space-y-2">
                      {message.parts.map((part, i) => {
                        if (part.type === "text" && part.text) {
                          const textPartKey = `${message.id}-text-${i}`;
                          return (
                            <div
                              key={textPartKey}
                              className={`rounded-lg px-4 py-2 text-sm ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {message.role === "assistant" ? (
                                <ModelResponseMarkdown>
                                  {part.text}
                                </ModelResponseMarkdown>
                              ) : (
                                <div className="whitespace-pre-wrap">
                                  {part.text}
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (isToolUIPart(part)) {
                          return (
                            <ToolCallCard
                              key={part.toolCallId}
                              toolName={getToolName(part)}
                              input={"input" in part ? part.input : undefined}
                              state={part.state}
                              output={
                                part.state === "output-available"
                                  ? part.output
                                  : undefined
                              }
                              errorText={
                                part.state === "output-error"
                                  ? part.errorText
                                  : undefined
                              }
                            />
                          );
                        }
                        return null;
                      })}
                      {assistantStats != null && (
                        <div className="mt-1">
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
              placeholder="Spør agenten om filmer..."
              disabled={isActive}
              autoFocus
            />
            <Button type="submit" disabled={isActive || !input.trim()}>
              Send
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Favoritter ({favorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Ingen favoritter ennå. Be agenten om å legge til noen!
                </p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((movie) => (
                    <div
                      key={movie.id}
                      className="text-sm p-2 rounded-md bg-muted/50"
                    >
                      <div className="font-medium text-xs">{movie.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {movie.year} · {movie.genre?.split(",")[0]}
                        {movie.rating && ` · ★ ${movie.rating}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tilgjengelige verktøy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(TOOL_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-mono shrink-0"
                  >
                    {key}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
