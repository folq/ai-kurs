import { embed } from "ai";
import {
  DEFAULT_EMBEDDING_MODEL,
  type EmbeddingModelId,
} from "@/lib/model-selectors";
import { getDb, type Movie } from "./db";
import { getEmbeddingModel } from "./openai";

export async function generateEmbedding(
  text: string,
  modelId: EmbeddingModelId = DEFAULT_EMBEDDING_MODEL,
): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(modelId),
    value: text,
    experimental_telemetry: { isEnabled: true },
  });
  return embedding;
}

export type SearchResult = Movie & { distance: number };

/**
 * sqlite-vec distance from a query embedding to a specific movie (same metric as semantic search).
 * Uses a full-table KNN sweep so the value matches `e.distance` from MATCH queries.
 */
export function distanceQueryEmbeddingToMovie(
  queryEmbedding: number[],
  movieId: number,
): number | null {
  const db = getDb();
  const buf = Buffer.from(new Float32Array(queryEmbedding).buffer);
  const { c } = db
    .prepare("SELECT COUNT(*) as c FROM movie_embeddings")
    .get() as { c: number };
  if (c === 0) return null;
  const results = db
    .prepare(
      `SELECT m.id, e.distance
       FROM movie_embeddings e
       INNER JOIN movies m ON m.id = e.movie_id
       WHERE e.embedding MATCH ? AND e.k = ?
       ORDER BY e.distance`,
    )
    .all(buf, c) as { id: number; distance: number }[];
  return results.find((r) => r.id === movieId)?.distance ?? null;
}

export async function queryToMovieVectorDistance(
  query: string,
  movieId: number,
  modelId: EmbeddingModelId = DEFAULT_EMBEDDING_MODEL,
): Promise<number | null> {
  const embedding = await generateEmbedding(query, modelId);
  return distanceQueryEmbeddingToMovie(embedding, movieId);
}

export function semanticSearchWithEmbedding(
  embedding: number[],
  limit = 10,
): SearchResult[] {
  const db = getDb();
  return db
    .prepare(
      `
      SELECT m.*, e.distance
      FROM movie_embeddings AS e
      INNER JOIN movies AS m ON m.id = e.movie_id
      WHERE e.embedding MATCH ? AND e.k = ?
      ORDER BY e.distance
    `,
    )
    .all(
      Buffer.from(new Float32Array(embedding).buffer),
      limit,
    ) as SearchResult[];
}

export async function semanticSearch(
  query: string,
  limit = 10,
  modelId: EmbeddingModelId = DEFAULT_EMBEDDING_MODEL,
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query, modelId);
  return semanticSearchWithEmbedding(embedding, limit);
}

export function keywordSearch(query: string, limit = 10): Movie[] {
  const db = getDb();
  const pattern = `%${query}%`;

  return db
    .prepare(
      `
      SELECT * FROM movies
      WHERE title LIKE ? OR description LIKE ? OR genre LIKE ?
      LIMIT ?
    `,
    )
    .all(pattern, pattern, pattern, limit) as Movie[];
}
