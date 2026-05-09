import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
