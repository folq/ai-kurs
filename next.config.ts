import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3", "@photostructure/sqlite-vec"],
};

export default nextConfig;
