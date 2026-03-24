import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MovieCard } from "@/components/shared/MovieCard";

type Movie = {
  id: number;
  title: string;
  year: number | null;
  type: "movie" | "tv_show";
  genre: string;
  description: string;
  rating: number | null;
  similarity?: string;
};

export default function EmbeddingsPage() {
  const [query, setQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<Movie[]>([]);
  const [keywordResults, setKeywordResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const fetchFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    setFavorites(new Set(data.map((f: { id: number }) => f.id)));
  }, []);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const [searchRes] = await Promise.all([
        fetch("/api/embeddings/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, limit: 8 }),
        }),
        fetchFavorites(),
      ]);
      const data = await searchRes.json();
      if (data.error) {
        console.error(data.error);
        return;
      }
      setSemanticResults(data.semantic);
      setKeywordResults(data.keyword);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (movieId: number) => {
    if (favorites.has(movieId)) {
      await fetch(`/api/favorites/${movieId}`, { method: "DELETE" });
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      });
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });
      setFavorites((prev) => new Set(prev).add(movieId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">3. Embeddings & Vector Search</h1>
        <p className="text-muted-foreground max-w-2xl">
          Type a natural-language description and find movies by <strong>meaning</strong>,
          not just keywords. The left column uses vector similarity search (embeddings),
          while the right column uses traditional SQL LIKE matching.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder='Try: "dark sci-fi about consciousness" or "feel-good comedy about friendship"'
          className="max-w-2xl"
        />
        <Button onClick={search} disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Semantic Search</h2>
              <Badge>Embeddings</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Finds movies by meaning — understands concepts, themes, and mood
              even when the exact words don't match.
            </p>
            {semanticResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No results. Make sure you've run{" "}
                  <code className="bg-muted px-1 rounded">npm run seed</code>{" "}
                  with your Azure OpenAI credentials.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {semanticResults.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={favorites.has(movie.id)}
                    onToggleFavorite={toggleFavorite}
                    showSimilarity
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Keyword Search</h2>
              <Badge variant="outline">SQL LIKE</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Traditional text matching — only finds movies where the exact
              words appear in the title, description, or genre.
            </p>
            {keywordResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No keyword matches found for "{query}".
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {keywordResults.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isFavorite={favorites.has(movie.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!searched && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Embeddings</strong> are numerical vectors that capture the
              semantic meaning of text. Similar concepts produce similar vectors.
            </p>
            <p>
              When you search, your query is converted into an embedding via
              Azure OpenAI's <code className="bg-muted px-1 rounded">text-embedding-3-small</code> model.
              This embedding is compared against pre-computed embeddings
              for every movie in the database using <strong>cosine distance</strong>.
            </p>
            <p>
              The vector search is powered by{" "}
              <code className="bg-muted px-1 rounded">sqlite-vec</code>, a
              SQLite extension for vector similarity search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
