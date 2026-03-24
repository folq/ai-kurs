import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./FavoriteButton";

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

type Props = {
  movie: Movie;
  isFavorite?: boolean;
  onToggleFavorite?: (movieId: number) => void;
  showSimilarity?: boolean;
};

export function MovieCard({
  movie,
  isFavorite = false,
  onToggleFavorite,
  showSimilarity = false,
}: Props) {
  const genres = movie.genre.split(",").map((g) => g.trim());

  return (
    <Card className="group relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">
              {movie.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {movie.year && <span>{movie.year}</span>}
              <Badge variant="outline" className="text-xs">
                {movie.type === "tv_show" ? "TV Show" : "Movie"}
              </Badge>
              {movie.rating && (
                <span className="font-medium text-foreground">
                  ★ {movie.rating}
                </span>
              )}
            </div>
          </div>
          {onToggleFavorite && (
            <FavoriteButton
              isFavorite={isFavorite}
              onClick={() => onToggleFavorite(movie.id)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {movie.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {genres.map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
        {showSimilarity && movie.similarity && (
          <div className="text-xs text-muted-foreground pt-1">
            Similarity: {(parseFloat(movie.similarity) * 100).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
