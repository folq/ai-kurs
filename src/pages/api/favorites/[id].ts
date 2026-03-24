import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { pagesMovieIdQuerySchema } from "@/lib/pages-api-schemas";
import {
  validatePagesMethod,
  validatePagesQuery,
} from "@/lib/validate-api";

function removeFavorite(
  _req: NextApiRequest,
  res: NextApiResponse,
  { id }: { id: number }
) {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM favorites WHERE movie_id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Favorite not found" });
  }

  return res.json({ message: "Removed from favorites" });
}

export default validatePagesMethod(
  "DELETE",
  validatePagesQuery(pagesMovieIdQuerySchema, removeFavorite)
);
