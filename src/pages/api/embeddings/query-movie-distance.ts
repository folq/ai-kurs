import type { NextApiRequest, NextApiResponse } from "next";
import { queryToMovieVectorDistance } from "@/lib/embeddings";
import type { EmbeddingModelId } from "@/lib/model-selectors";
import { queryMovieDistanceBodySchema } from "@/lib/pages-api-schemas";
import { validatePagesBody } from "@/lib/validate-api";

async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
  {
    movieId,
    query,
    embeddingModel,
  }: {
    movieId: number;
    query: string;
    embeddingModel?: EmbeddingModelId;
  },
) {
  try {
    const distance = await queryToMovieVectorDistance(
      query,
      movieId,
      embeddingModel,
    );
    if (distance == null) {
      return res.status(404).json({ error: "Movie embedding not found" });
    }
    return res.json({ distance });
  } catch (error) {
    console.error("query-movie-distance failed:", error);
    return res.status(500).json({ error: "Failed to compute distance" });
  }
}

export default validatePagesBody(queryMovieDistanceBodySchema, handler);
