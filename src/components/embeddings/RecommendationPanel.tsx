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

interface RecommendationPanelProps {
  selectedMovie: {
    id: number;
    title: string;
    genre: string;
    rating: number | null;
    year: number | null;
  } | null;
  similarMovies: SimilarMovie[];
  loading: boolean;
  onClear: () => void;
}

export function RecommendationPanel({
  selectedMovie,
  similarMovies,
  loading,
  onClear,
}: RecommendationPanelProps) {
  if (!selectedMovie) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground">
        Klikk på en film i 3D-visningen eller listen for å se anbefalinger
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Valgt film</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Tilbake
        </button>
      </div>

      <div className="p-3 bg-accent rounded-lg border border-primary/20">
        <div className="font-medium text-sm">{selectedMovie.title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {selectedMovie.year} · {selectedMovie.genre?.split(",")[0]}
          {selectedMovie.rating && ` · ★ ${selectedMovie.rating}`}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">
          Lignende filmer
          {loading && " (laster...)"}
        </h3>
        {!loading && similarMovies.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Ingen lignende filmer funnet
          </p>
        )}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {similarMovies.map((movie) => (
            <div
              key={movie.id}
              className="text-sm p-2 rounded-md bg-muted/50 border border-border"
            >
              <div className="font-medium text-xs">{movie.title}</div>
              <div className="text-xs text-muted-foreground">
                {movie.year} · {movie.genre?.split(",")[0]}
                {movie.rating && ` · ★ ${movie.rating}`}
                {movie.distance != null && (
                  <span className="ml-1 text-primary">
                    · {(1 - movie.distance).toFixed(2)} likhet
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
