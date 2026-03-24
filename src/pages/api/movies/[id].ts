import type { NextApiRequest, NextApiResponse } from "next";
import { getDb, type Movie } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const movie = db
    .prepare("SELECT * FROM movies WHERE id = ?")
    .get(req.query.id) as Movie | undefined;

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  return res.json(movie);
}
