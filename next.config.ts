import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  serverExternalPackages: [
    "@napi-rs/canvas",
    "unpdf",
    "pdfjs-dist",
  ],
};

export default nextConfig;