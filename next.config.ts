import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "pharm-lms-assets.e873083c40e80f37213e308a37eda200.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  /* allowedDevOrigins: ['127.0.0.1'], */
  /** Legacy course-studio fetches; handlers live under /api/tutor/courses */
  async rewrites() {
    return [
      {
        source: "/api/mentor/courses/:path*",
        destination: "/api/tutor/courses/:path*",
      },
    ];
  },
};

export default nextConfig;
