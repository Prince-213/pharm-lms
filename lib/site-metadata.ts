import type { Metadata } from "next";

const SITE_NAME = "PharmLMS";
const SITE_TAGLINE = "Clinical pharmacy learning for students and tutors";
const SITE_DESCRIPTION =
  "PharmLMS is a clinical pharmacy learning platform with video courses, structured curricula, certificates, and live instructor sessions — built for pharmacy students and professional tutors.";

function resolveSiteUrl(): string {
  const fromAuth =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromAuth) return fromAuth.replace(/\/$/, "");

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
  default: "/og/default.png",
  home: "/og/home.png",
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
    "pharmacy LMS",
    "clinical pharmacy",
    "pharmacy courses",
    "CPD",
    "pharmacy education",
    "Nigeria",
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
        url: ogImagePaths.default,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — clinical pharmacy courses online`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [ogImagePaths.default],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};
