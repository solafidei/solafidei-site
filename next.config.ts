import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // serve the standalone static quiz page (public/assessment/index.html) at the clean /assessment URL
  async rewrites() {
    return [{ source: "/assessment", destination: "/assessment/index.html" }];
  },
};

export default nextConfig;
