import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ModelComparison } from "@/components/prompting/ModelComparison";
import { UsageStats } from "@/components/shared/UsageStats";
import { PromptingTheory } from "@/components/theory/PromptingTheory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_LANGUAGE_MODEL,
  LANGUAGE_MODEL_OPTIONS,
  type LanguageModelId,
} from "@/lib/model-selectors";

const DEFAULT_SYSTEM_PROMPT = `You are a knowledgeable movie and TV show recommendation assistant. 
You help users discover new content based on their preferences, moods, and interests.
Be conversational, enthusiastic about great content, and provide specific reasons for your recommendations.
When recommending, mention the genre, year, and a brief reason why the user might enjoy it.`;

const PRESET_PROMPTS = {
  "Default Assistant": DEFAULT_SYSTEM_PROMPT,
  "Film Critic": `You are a distinguished film critic with decades of experience. 
You analyze movies and TV shows with deep insight into cinematography, narrative structure, and thematic elements.
Use sophisticated language but remain accessible. Reference other works for comparison.
Be honest — not everything is a masterpiece.`,
  "Spoiler-Free Guide": `You are a spoiler-free movie and TV show guide.
NEVER reveal plot twists, endings, or major surprises.
Focus on the premise, tone, and what makes each recommendation worth watching.
If a user asks about plot details that would be spoilers, politely decline.`,
  "Genre Expert": `You are a genre expert who specializes in helping people explore specific genres.
When users mention a genre, go deep — recommend hidden gems, explain sub-genres, and trace the evolution of that genre.
Always ask follow-up questions to narrow down what the user is looking for within a genre.`,
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

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onFinish: ({ message }) => {
      const metadata = (message as { metadata?: unknown }).metadata as
        | {
            usage?: {
              inputTokens: number;
              outputTokens: number;
              reasoningTokens?: number;
            };
          }
        | undefined;
      const usage = metadata?.usage;
      const startTime = streamStartRef.current;
      streamStartRef.current = null;
      if (usage && startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const tokPerSec = elapsed > 0 ? usage.outputTokens / elapsed : 0;
        setStreamStats((prev) => {
          const next = new Map(prev);
          next.set(message.id, {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when transcript updates (incl. streaming), not only when length changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          Model Comparison
        </button>
      </div>

      {workshopTab === "comparison" ? (
        <ModelComparison
          systemPrompt={systemPrompt}
          temperature={temperature}
          maxTokens={maxTokens}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Select
                    value={modelId}
                    onValueChange={(v) => setModelId(v as LanguageModelId)}
                  >
                    <SelectTrigger className="w-full">
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
                <p className="text-xs text-muted-foreground">
                  Selects which AI Gateway model powers chat completions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">System Prompt</CardTitle>
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
                  The system prompt sets the AI's role and behavior. Changes
                  apply to the next message you send.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Temperature</Label>
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
                    Low = deterministic and focused. High = creative and varied.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Max Tokens</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {maxTokens}
                    </span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={(v) =>
                      setMaxTokens(Array.isArray(v) ? v[0] : v)
                    }
                    min={64}
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
              Clear Conversation
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
                    Start a conversation about movies or TV shows...
                  </p>
                )}
                {messages.map((message: UIMessage) => {
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
                        {message.parts.map(
                          (part: UIMessage["parts"][number], i: number) => {
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
                          },
                        )}
                      </div>
                      {assistantStats != null && (
                        <div className="mt-1 max-w-[80%]">
                          <UsageStats
                            promptTokens={assistantStats.promptTokens}
                            completionTokens={assistantStats.completionTokens}
                            tokensPerSecond={assistantStats.tokensPerSecond}
                            reasoningTokens={assistantStats.reasoningTokens}
                            modelId={modelId}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {isActive && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground">
                      Thinking...
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
                placeholder="Ask for movie recommendations..."
                disabled={isActive}
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
