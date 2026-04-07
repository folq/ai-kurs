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
  /** Film from «Lignende filmer» currently emphasized in the 3D scatter. */
  highlightedSimilarId: number | null;
  onSimilarClick: (movieId: number) => void;
  onSimilarDoubleClick: (movieId: number) => void;
  onClear: () => void;
}

export function RecommendationPanel({
  selectedMovie,
  similarMovies,
  loading,
  highlightedSimilarId,
  onSimilarClick,
  onSimilarDoubleClick,
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
        <div className="mb-2">
          <h3 className="text-sm font-semibold">
            Lignende filmer
            {loading && " (laster...)"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enkeltklikk: fremhev eller skru av fremheving i 3D. Dobbeltklikk:
            velg som nytt utgangspunkt for lignende filmer.
          </p>
        </div>
        {!loading && similarMovies.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Ingen lignende filmer funnet
          </p>
        )}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {similarMovies.map((movie) => {
            const isHighlighted = highlightedSimilarId === movie.id;
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => onSimilarClick(movie.id)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  onSimilarDoubleClick(movie.id);
                }}
                className={`w-full text-left text-sm p-2 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isHighlighted
                    ? "bg-sky-500/10 border-sky-500/60 ring-1 ring-sky-500/40"
                    : "bg-muted/50 border-border hover:bg-muted hover:border-border/80"
                }`}
                aria-pressed={isHighlighted}
                aria-label={`«${movie.title}»: enkeltklikk for fremheving i 3D, dobbeltklikk for nytt utgangspunkt for anbefalinger`}
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
