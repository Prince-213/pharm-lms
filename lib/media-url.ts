import { getR2SignedGetUrl, isR2Configured } from "@/lib/storage/r2";

/**
 * Resolves stored media references for use in `<img src>` etc.
 * - `r2://<key>` → temporary signed HTTPS URL (R2)
 * - `https://`, `http://`, `/...` → unchanged
 */
export async function resolveMediaUrl(url: string | null | undefined): Promise<string | null> {
  const s = url?.trim();
  if (!s) return null;

  if (s.startsWith("r2://")) {
    if (!isR2Configured()) return null;
    const key = s.slice("r2://".length);
    if (!key) return null;
    try {
      return await getR2SignedGetUrl(key, 7200);
    } catch {
      return null;
    }
  }

  if (s.startsWith("https://") || s.startsWith("http://") || s.startsWith("/")) {
    return s;
  }

  return null;
}
