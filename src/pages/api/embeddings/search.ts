import type { NextApiRequest, NextApiResponse } from "next";
import { getEmbeddingScatterSpace } from "@/lib/embedding-scatter-space";
import {
  generateEmbedding,
  keywordSearch,
  semanticSearchWithEmbedding,
} from "@/lib/embeddings";
import type { EmbeddingModelId } from "@/lib/model-selectors";
import { embeddingsSearchBodySchema } from "@/lib/pages-api-schemas";
import { validatePagesBody } from "@/lib/validate-api";

async function search(
  _req: NextApiRequest,
  res: NextApiResponse,
  {
    query,
    limit,
    embeddingModel,
  }: { query: string; limit: number; embeddingModel?: EmbeddingModelId },
) {
  try {
    const embedding = await generateEmbedding(query, embeddingModel);
    const [semanticResults, keywordResults] = await Promise.all([
      Promise.resolve(semanticSearchWithEmbedding(embedding, limit)),
      keywordSearch(query, limit),
    ]);

    const { points, projectQuery } = getEmbeddingScatterSpace();
    const queryPoint = points.length > 0 ? projectQuery(embedding) : undefined;

    return res.json({
      semantic: semanticResults.map((r) => ({
        ...r,
        similarity: (1 - r.distance).toFixed(4),
      })),
      keyword: keywordResults,
      queryPoint,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error:
        "Search failed. Make sure you have run `npm run seed` with embeddings.",
    });
  }
}

export default validatePagesBody(embeddingsSearchBodySchema, search);
