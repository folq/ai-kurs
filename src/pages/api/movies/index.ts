import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { movieRowSchema } from "@/lib/db-rows";
import { validatePagesMethod } from "@/lib/validate-api";

function listMovies(_req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const raw = db.prepare("SELECT * FROM movies ORDER BY title").all();
  const movies = z.array(movieRowSchema).safeParse(raw);
  if (!movies.success) {
    return res.status(500).json({ error: z.prettifyError(movies.error) });
  }
  return res.json(movies.data);
}

export default validatePagesMethod("GET", listMovies);
