import { getDb, type Movie } from "./db";
import { getEmbeddingClient, getEmbeddingDeployment } from "./openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getEmbeddingClient();
  const response = await client.embeddings.create({
    model: getEmbeddingDeployment(),
    input: text,
  });
  return response.data[0].embedding;
}

export type SearchResult = Movie & { distance: number };

export async function semanticSearch(
  query: string,
  limit = 10
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(query);
  const db = getDb();

  const results = db
    .prepare(
      `
      SELECT m.*, e.distance
      FROM movie_embeddings AS e
      INNER JOIN movies AS m ON m.id = e.movie_id
      WHERE e.embedding MATCH ? AND e.k = ?
      ORDER BY e.distance
    `
    )
    .all(Buffer.from(new Float32Array(embedding).buffer), limit) as SearchResult[];

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
    `
    )
    .all(pattern, pattern, pattern, limit) as Movie[];
}
