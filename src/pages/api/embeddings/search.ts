import type { NextApiRequest, NextApiResponse } from "next";
import { semanticSearch, keywordSearch } from "@/lib/embeddings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, limit = 10 } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

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
      error: "Search failed. Make sure you have run `npm run seed` with embeddings.",
    });
  }
}
