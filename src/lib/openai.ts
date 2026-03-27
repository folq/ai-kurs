import { createGateway, gateway } from "ai";
import {
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_LANGUAGE_MODEL,
  type EmbeddingModelId,
  type LanguageModelId,
} from "@/lib/model-selectors";

const gatewayProvider =
  process.env.AI_GATEWAY_API_KEY || process.env.AI_GATEWAY_BASE_URL
    ? createGateway({
        apiKey: process.env.AI_GATEWAY_API_KEY,
        baseURL: process.env.AI_GATEWAY_BASE_URL,
      })
    : gateway;

export function getModel(modelId: LanguageModelId = DEFAULT_LANGUAGE_MODEL) {
  return gatewayProvider(modelId);
}

export function getEmbeddingModel(
  modelId: EmbeddingModelId = DEFAULT_EMBEDDING_MODEL,
) {
  return gatewayProvider.embeddingModel(modelId);
}
