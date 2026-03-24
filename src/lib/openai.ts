import { createAzure } from "@ai-sdk/azure";
import { AzureOpenAI } from "openai";

export const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

export function getModel() {
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  return azure(deployment);
}

export function getEmbeddingClient() {
  return new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: "2024-10-21",
  });
}

export function getEmbeddingDeployment() {
  return process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "text-embedding-3-small";
}
