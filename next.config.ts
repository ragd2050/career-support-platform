import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "dahcareer.vercel.app"],
    },
  },

  serverExternalPackages: [
    "@napi-rs/canvas",
    "unpdf",
    "pdfjs-dist",
    "pdf-parse",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        // نطاق Vercel Blob العام — يسمح لـ next/image يحمّل صور
        // البروفايل وأغلفة المشاريع المرفوعة عبر /api/upload
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;