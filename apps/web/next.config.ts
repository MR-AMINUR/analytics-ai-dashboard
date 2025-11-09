import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add a rewrite rule to proxy backend API calls
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/:path*", // Proxy to backend
      },
    ];
  },
};

export default nextConfig;

