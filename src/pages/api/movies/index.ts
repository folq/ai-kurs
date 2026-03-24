import type { NextApiRequest, NextApiResponse } from "next";
import { getDb, type Movie } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const movies = db.prepare("SELECT * FROM movies ORDER BY title").all() as Movie[];
  return res.json(movies);
}
