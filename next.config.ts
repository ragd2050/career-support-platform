import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  // pdf-parse (via its internal pdfjs-dist dependency) fails to bundle
  // correctly under the App Router's RSC webpack pipeline — reproducibly
  // throws "Object.defineProperty called on non-object" at import time
  // in /api/chat, unrelated to any resume data. Marking it (and its own
  // dependency) as an external server package tells Next.js to let
  // Node's native require() resolve it directly instead of running it
  // through webpack, which sidesteps the incompatibility entirely.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;