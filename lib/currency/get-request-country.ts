import { headers } from "next/headers";

/** ISO 3166-1 alpha-2 country code (uppercase) or null if unknown. */
export async function getRequestCountryCode(): Promise<string | null> {
  const h = await headers();

  // Vercel
  const vercel = h.get("x-vercel-ip-country")?.trim();
  if (vercel) return vercel.toUpperCase();

  // AWS CloudFront (future)
  const cloudFront = h.get("cloudfront-viewer-country")?.trim();
  if (cloudFront) return cloudFront.toUpperCase();

  return null;
}
