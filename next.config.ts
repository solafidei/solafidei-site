import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // ponytail: decks are self-contained static HTML in public/decks/<name>/index.html;
  // this rewrite just gives them a clean shareable URL.
  async rewrites() {
    return [
      { source: "/decks/:deck", destination: "/decks/:deck/index.html" },
    ];
  },
};

export default nextConfig;
