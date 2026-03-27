import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { validatePagesBody } from "@/lib/validate-api";

const similarBodySchema = z.object({
  movieId: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().positive().max(50).optional().default(8),
});

type SimilarBody = z.infer<typeof similarBodySchema>;

async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
  { movieId, limit }: SimilarBody,
) {
  try {
    const db = getDb();

    const movieRow = db
      .prepare("SELECT embedding FROM movie_embeddings WHERE movie_id = ?")
      .get(movieId) as { embedding: Buffer } | undefined;

    if (!movieRow) {
      return res.status(404).json({ error: "Movie embedding not found" });
    }

    const results = db
      .prepare(
        `SELECT m.id, m.title, m.genre, m.description, m.rating, m.year, m.type, e.distance
         FROM movie_embeddings AS e
         INNER JOIN movies AS m ON m.id = e.movie_id
         WHERE e.embedding MATCH ? AND e.k = ?
         ORDER BY e.distance`,
      )
      .all(movieRow.embedding, limit + 1) as Array<{
      id: number;
      title: string;
      genre: string;
      description: string;
      rating: number | null;
      year: number | null;
      type: string;
      distance: number;
    }>;

    const similar = results.filter((r) => r.id !== movieId).slice(0, limit);

    return res.json({ movieId, similar });
  } catch (error) {
    console.error("Similar search failed:", error);
    return res.status(500).json({ error: "Failed to find similar movies" });
  }
}

export default validatePagesBody(similarBodySchema, handler);
