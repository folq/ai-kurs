import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryScatterPoint } from "@/components/embeddings/EmbeddingsScatter";
import { RecommendationPanel } from "@/components/embeddings/RecommendationPanel";
import { PageShell } from "@/components/layout/PageShell";
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
        Laster 3D-visualisering...
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
  const [queryInSpace, setQueryInSpace] = useState<QueryScatterPoint | null>(
    null,
  );
  const [queryToSelectedDistance, setQueryToSelectedDistance] = useState<
    number | null
  >(null);
  const [queryDistanceLoading, setQueryDistanceLoading] = useState(false);
  const [highlightedSimilarId, setHighlightedSimilarId] = useState<
    number | null
  >(null);
  const lastSimilarClickTimeRef = useRef(0);
  const lastSimilarClickMovieIdRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (selectedMovieId == null || queryInSpace == null) {
      setQueryToSelectedDistance(null);
      setQueryDistanceLoading(false);
      return;
    }
    const ac = new AbortController();
    setQueryDistanceLoading(true);
    setQueryToSelectedDistance(null);
    fetch("/api/embeddings/query-movie-distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movieId: selectedMovieId,
        query: queryInSpace.query,
        embeddingModel: embeddingModelId,
      }),
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((data: { distance?: number }) => {
        if (ac.signal.aborted) return;
        if (typeof data.distance === "number") {
          setQueryToSelectedDistance(data.distance);
        } else {
          setQueryToSelectedDistance(null);
        }
      })
      .catch(() => {
        if (!ac.signal.aborted) setQueryToSelectedDistance(null);
      })
      .finally(() => {
        if (!ac.signal.aborted) setQueryDistanceLoading(false);
      });
    return () => ac.abort();
  }, [selectedMovieId, queryInSpace, embeddingModelId]);

  const handleSelectMovie = useCallback(async (id: number | null) => {
    setHighlightedSimilarId(null);
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

  /** Second click on the same row within this window skips toggle (double-click selects). */
  const SIMILAR_DOUBLE_CLICK_GUARD_MS = 350;

  const handleSimilarSingleClick = useCallback((movieId: number) => {
    const now = Date.now();
    const isRapidSecondOnSameRow =
      lastSimilarClickMovieIdRef.current === movieId &&
      now - lastSimilarClickTimeRef.current < SIMILAR_DOUBLE_CLICK_GUARD_MS;

    if (isRapidSecondOnSameRow) {
      return;
    }

    lastSimilarClickTimeRef.current = now;
    lastSimilarClickMovieIdRef.current = movieId;

    setHighlightedSimilarId((prev) => (prev === movieId ? null : movieId));
  }, []);

  const handleSimilarDoubleClick = useCallback(
    (movieId: number) => {
      lastSimilarClickTimeRef.current = 0;
      lastSimilarClickMovieIdRef.current = null;
      void handleSelectMovie(movieId);
    },
    [handleSelectMovie],
  );

  const search = async () => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    setLoading(true);
    setSearched(true);
    setQueryInSpace(null);

    try {
      const [searchRes] = await Promise.all([
        fetch("/api/embeddings/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            limit: 8,
            embeddingModel: embeddingModelId,
          }),
        }),
        fetchFavorites(),
      ]);
      const data = await searchRes.json();
      if (data.error) {
        console.error(data.error);
        setQueryInSpace(null);
        return;
      }
      setSemanticResults(data.semantic);
      setKeywordResults(data.keyword);
      const qp = data.queryPoint as
        | { x: number; y: number; z: number }
        | undefined;
      if (
        qp &&
        typeof qp.x === "number" &&
        typeof qp.y === "number" &&
        typeof qp.z === "number"
      ) {
        setQueryInSpace({ x: qp.x, y: qp.y, z: qp.z, query: trimmed });
      } else {
        setQueryInSpace(null);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setQueryInSpace(null);
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
          placeholder='Prøv: "mørk sci-fi om bevissthet" eller "feelgood-komedie om vennskap"'
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
          {loading ? "Søker..." : "Søk"}
        </Button>
      </div>

      {searched && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Semantisk søk</h2>
              <Badge>Embeddings</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Finner filmer etter mening — forstår konsepter, temaer og stemning
              selv når de eksakte ordene ikke stemmer.
            </p>
            {semanticResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen resultater. Sjekk at du har kjørt{" "}
                  <code className="bg-muted px-1 rounded">npm run seed</code>{" "}
                  med din AI Gateway API-nøkkel.
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
              <h2 className="text-xl font-semibold">Nøkkelordsøk</h2>
              <Badge variant="outline">SQL LIKE</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tradisjonell tekstmatching — finner bare filmer der de eksakte
              ordene finnes i tittelen, beskrivelsen eller sjangeren.
            </p>
            {keywordResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen nøkkelordtreff funnet for «{query}».
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
            <CardTitle className="text-base">Hvordan det fungerer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Embeddings</strong> er numeriske vektorer som fanger den
              semantiske meningen i tekst. Lignende konsepter gir lignende
              vektorer.
            </p>
            <p>
              Når du søker, konverteres spørringen din til en embedding via AI
              Gateways{" "}
              <code className="bg-muted px-1 rounded">
                text-embedding-3-small
              </code>{" "}
              modell. Denne embeddingen sammenlignes med forhåndsberegnede
              embeddings for hver film i databasen ved hjelp av{" "}
              <strong>kosinusavstand</strong>.
            </p>
            <p>
              Vektorsøket drives av{" "}
              <code className="bg-muted px-1 rounded">sqlite-vec</code>, en
              SQLite-utvidelse for vektorlikhetssøk.
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
              queryInSpace={queryInSpace}
              neighborDistances={similarMovies.map((m) => ({
                movieId: m.id,
                distance: m.distance,
              }))}
              queryLineDistance={
                selectedMovieId != null && queryInSpace
                  ? {
                      loading: queryDistanceLoading,
                      distance: queryToSelectedDistance,
                    }
                  : null
              }
              listHighlightId={highlightedSimilarId}
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
                  highlightedSimilarId={highlightedSimilarId}
                  onSimilarClick={handleSimilarSingleClick}
                  onSimilarDoubleClick={handleSimilarDoubleClick}
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
