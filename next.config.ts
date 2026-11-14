import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  agentRules: false,
  partialPrefetching: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn-images.dzcdn.net", pathname: "/images/cover/**" },
      { protocol: "https", hostname: "cdn-images.dzcdn.net", pathname: "/images/artist/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
