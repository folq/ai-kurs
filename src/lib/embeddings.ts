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
  });
  return embedding;
}

export type SearchResult = Movie & { distance: number };

export async function semanticSearch(
  query: string,
  limit = 10,
  modelId: EmbeddingModelId = DEFAULT_EMBEDDING_MODEL,
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query, modelId);
  const db = getDb();

  const results = db
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

  return results;
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
