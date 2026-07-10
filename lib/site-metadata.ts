import type { Metadata } from "next";

const SITE_NAME = "PharmLMS";
const SITE_TAGLINE = "From dispensing to decision-making";
const SITE_DESCRIPTION =
  "PharmLMS is Africa's first pharmacy-specific digital health education platform — equipping pharmacists with the clinical, data, and technology skills to thrive in the digital health economy.";

function resolveSiteUrl(): string {
  const fromEnv =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.AWS_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/** Absolute site origin (no trailing slash). */
export const siteUrl = resolveSiteUrl();

/**
 * Open Graph images — add files under `public/og/`:
 * - `default.png` (1200×630) — site-wide fallback
 * - `home.png` (optional) — homepage / marketing
 */
export const ogImagePaths = {
  default: "/og/default.jpg",
  home: "/og/home.jpg",
} as const;

export const siteConfig = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  url: siteUrl,
} as const;

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "pharmacy education",
    "digital health",
    "clinical pharmacy",
    "CPD",
    "pharmacy courses",
    "Africa",
    "health technology",
    "pharmacy LMS",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogImagePaths.home,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — clinical pharmacy courses online`,
      },
      {
        url: ogImagePaths.default,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [ogImagePaths.home, ogImagePaths.default],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/seo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/seo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/seo/favicon.ico" },
    ],
    apple: [{ url: "/seo/apple-touch-icon.png" }],
    other: [
      { rel: "manifest", url: "/seo/site.webmanifest" },
    ],
  },
};
