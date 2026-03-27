import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/layout/PageShell";
import { RecommendationPanel } from "@/components/embeddings/RecommendationPanel";
import { MovieCard } from "@/components/shared/MovieCard";
import { EmbeddingsTheory } from "@/components/theory/EmbeddingsTheory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_EMBEDDING_MODEL,
  EMBEDDING_MODEL_OPTIONS,
  type EmbeddingModelId,
} from "@/lib/model-selectors";

const EmbeddingsScatter = dynamic(
  () => import("@/components/embeddings/EmbeddingsScatter"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
        Loading 3D visualization...
      </div>
    ),
  },
);

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

type MoviePoint = {
  id: number;
  title: string;
  genre: string;
  rating: number | null;
  year: number | null;
  type: string;
  x: number;
  y: number;
  z: number;
};

type SimilarMovie = {
  id: number;
  title: string;
  year: number | null;
  type: "movie" | "tv_show";
  genre: string;
  description: string;
  rating: number | null;
  distance: number;
};

export default function EmbeddingsPage() {
  const [query, setQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<Movie[]>([]);
  const [keywordResults, setKeywordResults] = useState<Movie[]>([]);
  const [embeddingModelId, setEmbeddingModelId] = useState<EmbeddingModelId>(
    DEFAULT_EMBEDDING_MODEL,
  );
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [allMovies, setAllMovies] = useState<MoviePoint[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [vizLoaded, setVizLoaded] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    setFavorites(new Set(data.map((f: { id: number }) => f.id)));
  }, []);

  useEffect(() => {
    fetch("/api/embeddings/all")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllMovies(data);
          setVizLoaded(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectMovie = useCallback(async (id: number | null) => {
    setSelectedMovieId(id);
    if (id == null) {
      setSimilarMovies([]);
      return;
    }
    setLoadingSimilar(true);
    try {
      const res = await fetch("/api/embeddings/similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: id, limit: 8 }),
      });
      const data = await res.json();
      setSimilarMovies(data.similar || []);
    } catch {
      setSimilarMovies([]);
    } finally {
      setLoadingSimilar(false);
    }
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
          body: JSON.stringify({
            query,
            limit: 8,
            embeddingModel: embeddingModelId,
          }),
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
    <PageShell
      title="3. Embeddings & Vector Search"
      description="Søk etter filmer basert på mening, ikke bare nøkkelord."
      theory={<EmbeddingsTheory />}
    >
      <div className="flex gap-2 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder='Try: "dark sci-fi about consciousness" or "feel-good comedy about friendship"'
          className="max-w-xl"
        />
        <Select
          value={embeddingModelId}
          onValueChange={(v) => setEmbeddingModelId(v as EmbeddingModelId)}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMBEDDING_MODEL_OPTIONS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="self-center">
          Embeddings: {embeddingModelId}
        </Badge>
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
                  with your AI Gateway API key.
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
              semantic meaning of text. Similar concepts produce similar
              vectors.
            </p>
            <p>
              When you search, your query is converted into an embedding via AI
              Gateway's{" "}
              <code className="bg-muted px-1 rounded">
                text-embedding-3-small
              </code>{" "}
              model. This embedding is compared against pre-computed embeddings
              for every movie in the database using{" "}
              <strong>cosine distance</strong>.
            </p>
            <p>
              The vector search is powered by{" "}
              <code className="bg-muted px-1 rounded">sqlite-vec</code>, a
              SQLite extension for vector similarity search.
            </p>
          </CardContent>
        </Card>
      )}

      {vizLoaded && allMovies.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Visualisering & Anbefalinger
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <EmbeddingsScatter
              points={allMovies}
              selectedId={selectedMovieId}
              neighborIds={similarMovies.map((m) => m.id)}
              searchHitIds={semanticResults.map((m) => m.id)}
              onSelectMovie={handleSelectMovie}
            />
            <Card>
              <CardContent className="p-4">
                <RecommendationPanel
                  selectedMovie={
                    selectedMovieId
                      ? allMovies.find((m) => m.id === selectedMovieId) || null
                      : null
                  }
                  similarMovies={similarMovies}
                  loading={loadingSimilar}
                  onClear={() => handleSelectMovie(null)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
