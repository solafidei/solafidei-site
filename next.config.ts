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
  // shareable != indexable: these are named-client proposals. noindex via header
  // rather than robots.txt Disallow, so crawlers can still read the directive.
  async headers() {
    return [
      {
        source: "/decks/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
