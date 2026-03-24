import type { NextApiRequest, NextApiResponse } from "next";
import { semanticSearch, keywordSearch } from "@/lib/embeddings";
import { embeddingsSearchBodySchema } from "@/lib/pages-api-schemas";
import { validatePagesBody } from "@/lib/validate-api";

async function search(
  _req: NextApiRequest,
  res: NextApiResponse,
  { query, limit }: { query: string; limit: number }
) {
  try {
    const [semanticResults, keywordResults] = await Promise.all([
      semanticSearch(query, limit),
      keywordSearch(query, limit),
    ]);

    return res.json({
      semantic: semanticResults.map((r) => ({
        ...r,
        similarity: (1 - r.distance).toFixed(4),
      })),
      keyword: keywordResults,
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
