import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const toModule = (name: string) => path.join(projectRoot, "node_modules", name);

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: toModule("tailwindcss"),
      "@tailwindcss/postcss": toModule("@tailwindcss/postcss"),
    },
  },
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
      // If you switch media to AWS S3, add your bucket public hostname, e.g.:
      // { protocol: "https", hostname: "pharm-lms-assets.s3.<region>.amazonaws.com" },
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
  async redirects() {
    return [
      {
        source: "/for-instructors",
        destination: "/teach",
        permanent: true,
      },
      {
        source: "/for-mentors",
        destination: "/become-a-mentor",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
