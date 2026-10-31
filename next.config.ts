import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";
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
        hostname:
          "pharm-lms-assets.e873083c40e80f37213e308a37eda200.r2.cloudflarestorage.com",
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              'camera=(self "https://meet.jit.si"), microphone=(self "https://meet.jit.si"), geolocation=()',
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://accounts.google.com https://appleid.cdn-apple.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://accounts.google.com https://appleid.apple.com https://meet.jit.si",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
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

const disableSentrySourcemaps =
  process.env.DISABLE_SENTRY_SOURCEMAP_UPLOAD === "1" ||
  !process.env.SENTRY_AUTH_TOKEN?.trim();

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "princo",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Skip sourcemap upload unless SENTRY_AUTH_TOKEN is set (and not explicitly disabled).
  // Keeps local/EC2 builds from hanging on Sentry network work.
  sourcemaps: {
    disable: disableSentrySourcemaps,
  },

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: !disableSentrySourcemaps,

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
