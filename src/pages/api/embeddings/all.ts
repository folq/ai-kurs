import type { NextApiRequest, NextApiResponse } from "next";
import { getEmbeddingScatterSpace } from "@/lib/embedding-scatter-space";
import { validatePagesMethod } from "@/lib/validate-api";

function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const { points } = getEmbeddingScatterSpace();
    return res.json(points);
  } catch (error) {
    console.error("Failed to compute embeddings:", error);
    return res.status(500).json({ error: "Failed to compute 3D positions" });
  }
}

export default validatePagesMethod("GET", handler);
