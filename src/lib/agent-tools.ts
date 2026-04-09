import { tool } from "ai";
import { z } from "zod";
import { DEFAULT_TOOL_DESCRIPTIONS } from "@/lib/agent-tool-descriptions";
import { DEFAULT_EMBEDDING_MODEL } from "@/lib/model-selectors";
import { type Favorite, getDb, type Movie } from "./db";
import { semanticSearch } from "./embeddings";

export type AgentToolName = keyof typeof DEFAULT_TOOL_DESCRIPTIONS;

export function buildAgentTools(overrides?: Partial<Record<string, string>>) {
  const desc = { ...DEFAULT_TOOL_DESCRIPTIONS, ...overrides };

  return {
    searchMovies: tool({
      description: desc.searchMovies,
      inputSchema: z.object({
        query: z.string().describe("Natural language search query"),
        limit: z
          .number()
          .optional()
          .default(5)
          .describe("Max results to return"),
      }),
      execute: async ({ query, limit }) => {
        const results = await semanticSearch(
          query,
          limit,
          DEFAULT_EMBEDDING_MODEL,
        );
        return results.map((r) => ({
          id: r.id,
          title: r.title,
          year: r.year,
          type: r.type,
          genre: r.genre,
          description: r.description,
          rating: r.rating,
          similarity: (1 - r.distance).toFixed(3),
        }));
      },
    }),

    getMovieDetails: tool({
      description: desc.getMovieDetails,
      inputSchema: z.object({
        movieId: z.number().describe("The movie ID"),
      }),
      execute: async ({ movieId }) => {
        const db = getDb();
        const movie = db
          .prepare("SELECT * FROM movies WHERE id = ?")
          .get(movieId) as Movie | undefined;
        if (!movie) return { error: "Movie not found" };
        return movie;
      },
    }),

    addToFavorites: tool({
      description: desc.addToFavorites,
      inputSchema: z.object({
        movieId: z.number().describe("The movie ID to add"),
        note: z
          .string()
          .optional()
          .describe("Optional personal note about why it's a favorite"),
      }),
      execute: async ({ movieId, note }) => {
        const db = getDb();
        const movie = db
          .prepare("SELECT * FROM movies WHERE id = ?")
          .get(movieId) as Movie | undefined;
        if (!movie) return { error: "Movie not found" };

        const existing = db
          .prepare("SELECT * FROM favorites WHERE movie_id = ?")
          .get(movieId) as Favorite | undefined;
        if (existing)
          return { message: `${movie.title} is already in favorites` };

        db.prepare("INSERT INTO favorites (movie_id, note) VALUES (?, ?)").run(
          movieId,
          note ?? null,
        );
        return { message: `Added ${movie.title} to favorites` };
      },
    }),

    removeFromFavorites: tool({
      description: desc.removeFromFavorites,
      inputSchema: z.object({
        movieId: z.number().describe("The movie ID to remove"),
      }),
      execute: async ({ movieId }) => {
        const db = getDb();
        const result = db
          .prepare("DELETE FROM favorites WHERE movie_id = ?")
          .run(movieId);
        if (result.changes === 0)
          return { message: "Movie was not in favorites" };
        return { message: "Removed from favorites" };
      },
    }),

    getFavorites: tool({
      description: desc.getFavorites,
      inputSchema: z.object({}),
      execute: async () => {
        const db = getDb();
        const favorites = db
          .prepare(
            `
            SELECT f.id as favorite_id, f.note, f.created_at as favorited_at,
                   m.*
            FROM favorites f
            JOIN movies m ON m.id = f.movie_id
            ORDER BY f.created_at DESC
          `,
          )
          .all() as (Movie & {
          favorite_id: number;
          note: string | null;
          favorited_at: string;
        })[];
        return favorites;
      },
    }),

    recommendSimilar: tool({
      description: desc.recommendSimilar,
      inputSchema: z.object({
        movieId: z
          .number()
          .describe("The movie ID to find similar content for"),
        limit: z
          .number()
          .optional()
          .default(5)
          .describe("Max results to return"),
      }),
      execute: async ({ movieId, limit }) => {
        const db = getDb();
        const movie = db
          .prepare("SELECT * FROM movies WHERE id = ?")
          .get(movieId) as Movie | undefined;
        if (!movie) return { error: "Movie not found" };

        const query = `${movie.title} (${movie.genre}): ${movie.description}`;
        const results = await semanticSearch(
          query,
          limit + 1,
          DEFAULT_EMBEDDING_MODEL,
        );
        return results
          .filter((r) => r.id !== movieId)
          .slice(0, limit)
          .map((r) => ({
            id: r.id,
            title: r.title,
            year: r.year,
            type: r.type,
            genre: r.genre,
            description: r.description,
            rating: r.rating,
            similarity: (1 - r.distance).toFixed(3),
          }));
      },
    }),
  };
}

export const agentTools = buildAgentTools();
