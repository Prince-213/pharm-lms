import { withSentryConfig } from "@sentry/nextjs";
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "princo",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
