import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // ✅ Turbopack alias instead of webpack
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // ✅ Proxy backend only in development
  async rewrites() {
    if (isDev) {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:4000/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
