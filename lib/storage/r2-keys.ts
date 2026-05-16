/** Extract object key from stored `r2://key` reference. */
export function r2KeyFromMediaUrl(url: string | null | undefined): string | null {
  const s = url?.trim();
  if (!s?.startsWith("r2://")) return null;
  const key = s.slice("r2://".length);
  return key.length > 0 ? key : null;
}
