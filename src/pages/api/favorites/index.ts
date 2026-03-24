import type { NextApiRequest, NextApiResponse } from "next";
import { getDb, type Movie, type Favorite } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === "GET") {
    const favorites = db
      .prepare(
        `SELECT f.id as favorite_id, f.note, f.created_at as favorited_at, m.*
         FROM favorites f JOIN movies m ON m.id = f.movie_id
         ORDER BY f.created_at DESC`
      )
      .all() as (Movie & { favorite_id: number; note: string | null; favorited_at: string })[];
    return res.json(favorites);
  }

  if (req.method === "POST") {
    const { movieId, note } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: "movieId is required" });
    }

    const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(movieId) as Movie | undefined;
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const existing = db
      .prepare("SELECT * FROM favorites WHERE movie_id = ?")
      .get(movieId) as Favorite | undefined;
    if (existing) {
      return res.json({ message: "Already in favorites", favorite: existing });
    }

    const result = db
      .prepare("INSERT INTO favorites (movie_id, note) VALUES (?, ?)")
      .run(movieId, note ?? null);

    return res.status(201).json({ id: result.lastInsertRowid, movieId, note });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
