/** Strip one pair of surrounding quotes (common when pasting secrets from env UIs). */
function stripSurroundingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Single source of truth for JWT signing/verification (NextAuth + getToken in middleware).
 * Prefer AUTH_SECRET; NEXTAUTH_SECRET is a common alias in dashboards.
 */
export function getAuthSecret(): string | undefined {
  const raw =
    process.env.AUTH_SECRET?.trim() ?? process.env.NEXTAUTH_SECRET?.trim();
  if (!raw) return undefined;
  const cleaned = stripSurroundingQuotes(raw).trim();
  return cleaned || undefined;
}

export function isAuthSecretConfigured(): boolean {
  return Boolean(getAuthSecret());
}

/** Verbose auth/proxy logging for Netlify (set AUTH_TRACE=true). */
export function authTraceEnabled(): boolean {
  const v = process.env.AUTH_TRACE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
