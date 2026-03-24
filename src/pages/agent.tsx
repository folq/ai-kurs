import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type FavoriteMovie = {
  id: number;
  title: string;
  year: number | null;
  genre: string;
  rating: number | null;
  note: string | null;
};

const TOOL_LABELS: Record<string, string> = {
  searchMovies: "Searching movies",
  getMovieDetails: "Getting details",
  addToFavorites: "Adding to favorites",
  removeFromFavorites: "Removing from favorites",
  getFavorites: "Getting favorites",
  recommendSimilar: "Finding similar",
};

function ToolCallCard({
  toolName,
  args,
  result,
}: {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md bg-muted/50 border text-xs hover:bg-muted transition-colors">
        <Badge variant="outline" className="text-xs shrink-0">
          Tool
        </Badge>
        <span className="font-medium">{TOOL_LABELS[toolName] || toolName}</span>
        {args && Object.keys(args).length > 0 && (
          <span className="text-muted-foreground truncate">
            ({Object.entries(args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ")})
          </span>
        )}
        <span className="ml-auto text-muted-foreground">{open ? "▲" : "▼"}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
          <div className="text-muted-foreground mb-1">Result:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent/chat" }),
    []
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isActive = status === "submitted" || status === "streaming";

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">4. Agent</h1>
        <p className="text-muted-foreground max-w-2xl">
          A conversational agent with <strong>tools</strong> that ties everything
          together. It can search movies semantically, manage your favorites, and
          find similar content — all through natural conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <Card className="flex flex-col h-[calc(100vh-220px)]">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Agent Chat</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {Object.keys(TOOL_LABELS).length} tools available
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4"
          >
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Try asking the agent to find movies for you!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Find me dark sci-fi movies about AI",
                      "What's in my favorites?",
                      "Recommend something like Inception",
                      "Find feel-good comedies and add the best one to my favorites",
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
              {messages.map((message: UIMessage) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%] space-y-2">
                    {message.parts.map((part: UIMessage["parts"][number], i: number) => {
                      if (part.type === "text" && part.text) {
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className={`rounded-lg px-4 py-2 text-sm ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{part.text}</div>
                          </div>
                        );
                      }
                      if (part.type && part.type.startsWith("tool-")) {
                        const toolPart = part as unknown as {
                          type: string;
                          toolCallId: string;
                          toolName: string;
                          args: Record<string, unknown>;
                          state: string;
                          result?: unknown;
                        };
                        return (
                          <ToolCallCard
                            key={`${message.id}-${i}`}
                            toolName={toolPart.toolName}
                            args={toolPart.args}
                            result={toolPart.result}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
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
              placeholder="Ask the agent about movies..."
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
                Favorites ({favorites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No favorites yet. Ask the agent to add some!
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
              <CardTitle className="text-base">Available Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(TOOL_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono shrink-0">
                    {key}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
