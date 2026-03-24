import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const result = db
    .prepare("DELETE FROM favorites WHERE movie_id = ?")
    .run(req.query.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Favorite not found" });
  }

  return res.json({ message: "Removed from favorites" });
}
