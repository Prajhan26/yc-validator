import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/genai"],
  // Required: this folder sits under another directory that also has a
  // package-lock.json, so Turbopack would otherwise infer the wrong workspace
  // root. Pin it to this project so module resolution stays correct.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
