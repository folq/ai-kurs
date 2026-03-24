import { z } from "zod";
import type { Favorite, Movie } from "@/lib/db";

const movieRowZ = z.object({
  id: z.number(),
  title: z.string(),
  year: z.number().nullable(),
  type: z.enum(["movie", "tv_show"]),
  genre: z.string(),
  description: z.string(),
  rating: z.number().nullable(),
  poster_url: z.string().nullable(),
  created_at: z.string(),
});

export const movieRowSchema: z.ZodType<Movie> = movieRowZ;

export const favoriteRowSchema: z.ZodType<Favorite> = z.object({
  id: z.number(),
  movie_id: z.number(),
  note: z.string().nullable(),
  created_at: z.string(),
});

export const favoriteListRowSchema = movieRowZ.and(
  z.object({
    favorite_id: z.number(),
    note: z.string().nullable(),
    favorited_at: z.string(),
  }),
);
