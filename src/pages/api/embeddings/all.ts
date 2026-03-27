import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { pca3d } from "@/lib/pca";
import { validatePagesMethod } from "@/lib/validate-api";

type MoviePoint = {
  id: number;
  title: string;
  genre: string;
  rating: number | null;
  year: number | null;
  type: string;
  x: number;
  y: number;
  z: number;
};

let cachedResult: MoviePoint[] | null = null;

function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (cachedResult) {
    return res.json(cachedResult);
  }

  try {
    const db = getDb();

    const rows = db
      .prepare(
        `SELECT m.id, m.title, m.genre, m.rating, m.year, m.type, e.embedding
         FROM movies m
         INNER JOIN movie_embeddings e ON e.movie_id = m.id
         ORDER BY m.id`,
      )
      .all() as Array<{
      id: number;
      title: string;
      genre: string;
      rating: number | null;
      year: number | null;
      type: string;
      embedding: Buffer;
    }>;

    if (rows.length === 0) {
      return res.json([]);
    }

    const embeddings = rows.map((row) => {
      const float32 = new Float32Array(
        row.embedding.buffer,
        row.embedding.byteOffset,
        row.embedding.byteLength / 4,
      );
      return Array.from(float32);
    });

    const points = pca3d(embeddings);

    cachedResult = rows.map((row, i) => ({
      id: row.id,
      title: row.title,
      genre: row.genre,
      rating: row.rating,
      year: row.year,
      type: row.type,
      x: points[i].x,
      y: points[i].y,
      z: points[i].z,
    }));

    return res.json(cachedResult);
  } catch (error) {
    console.error("Failed to compute embeddings:", error);
    return res.status(500).json({ error: "Failed to compute 3D positions" });
  }
}

export default validatePagesMethod("GET", handler);
