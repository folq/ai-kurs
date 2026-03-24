import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  favoriteListRowSchema,
  favoriteRowSchema,
  movieRowSchema,
} from "@/lib/db-rows";
import { postFavoriteBodySchema } from "@/lib/pages-api-schemas";
import { pagesRouter, validatePagesBody } from "@/lib/validate-api";

function getFavorites(_req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const raw = db
    .prepare(
      `SELECT f.id as favorite_id, f.note, f.created_at as favorited_at, m.*
       FROM favorites f JOIN movies m ON m.id = f.movie_id
       ORDER BY f.created_at DESC`,
    )
    .all();
  const favorites = z.array(favoriteListRowSchema).safeParse(raw);
  if (!favorites.success) {
    return res.status(500).json({ error: z.prettifyError(favorites.error) });
  }
  return res.json(favorites.data);
}

const postFavorite = validatePagesBody(
  postFavoriteBodySchema,
  async (_req, res, { movieId, note }) => {
    const db = getDb();

    const movieRaw = db
      .prepare("SELECT * FROM movies WHERE id = ?")
      .get(movieId);
    const movie = movieRowSchema.safeParse(movieRaw);
    if (!movie.success) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const existingRaw = db
      .prepare("SELECT * FROM favorites WHERE movie_id = ?")
      .get(movieId);
    if (existingRaw) {
      const existing = favoriteRowSchema.safeParse(existingRaw);
      if (!existing.success) {
        return res.status(500).json({ error: z.prettifyError(existing.error) });
      }
      return res.json({
        message: "Already in favorites",
        favorite: existing.data,
      });
    }

    const result = db
      .prepare("INSERT INTO favorites (movie_id, note) VALUES (?, ?)")
      .run(movieId, note ?? null);

    return res.status(201).json({ id: result.lastInsertRowid, movieId, note });
  },
);

export default pagesRouter({
  GET: getFavorites,
  POST: postFavorite,
});
