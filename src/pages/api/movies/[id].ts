import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { movieRowSchema } from "@/lib/db-rows";
import { pagesMovieIdQuerySchema } from "@/lib/pages-api-schemas";
import { validatePagesMethod, validatePagesQuery } from "@/lib/validate-api";

function getMovie(
  _req: NextApiRequest,
  res: NextApiResponse,
  { id }: { id: number },
) {
  const db = getDb();
  const movieRaw = db.prepare("SELECT * FROM movies WHERE id = ?").get(id);
  const movie = movieRowSchema.safeParse(movieRaw);
  if (!movie.success) {
    return res.status(404).json({ error: "Movie not found" });
  }
  return res.json(movie.data);
}

export default validatePagesMethod(
  "GET",
  validatePagesQuery(pagesMovieIdQuerySchema, getMovie),
);
