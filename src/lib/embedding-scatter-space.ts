import { getDb } from "@/lib/db";
import { fitPca3d } from "@/lib/pca";

export type EmbeddingScatterMovie = {
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

type Cache = {
  points: EmbeddingScatterMovie[];
  projectQuery: (embedding: number[]) => { x: number; y: number; z: number };
};

let cache: Cache | null = null;

/**
 * PCA 3D positions for all movies plus a projector for arbitrary query embeddings
 * (same normalization as the scatter plot).
 */
export function getEmbeddingScatterSpace(): Cache {
  if (cache) return cache;

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
    cache = {
      points: [],
      projectQuery: () => ({ x: 0, y: 0, z: 0 }),
    };
    return cache;
  }

  const embeddings = rows.map((row) => {
    const float32 = new Float32Array(
      row.embedding.buffer,
      row.embedding.byteOffset,
      row.embedding.byteLength / 4,
    );
    return Array.from(float32);
  });

  const { points, project } = fitPca3d(embeddings);

  cache = {
    points: rows.map((row, i) => ({
      id: row.id,
      title: row.title,
      genre: row.genre,
      rating: row.rating,
      year: row.year,
      type: row.type,
      x: points[i].x,
      y: points[i].y,
      z: points[i].z,
    })),
    projectQuery: project,
  };

  return cache;
}
