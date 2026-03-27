import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  serverExternalPackages: [
    "better-sqlite3",
    "@photostructure/sqlite-vec",
    "@opentelemetry/sdk-trace-node",
    "@langfuse/otel",
    "@langfuse/tracing",
  ],
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/movies.db"],
    "/api/embeddings/*": ["./data/movies.db"],
  },
};

export default nextConfig;
