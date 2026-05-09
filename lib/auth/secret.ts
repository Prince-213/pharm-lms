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
 * Single source of truth for JWT signing (NextAuth) and verification (getToken in proxy).
 * Prefer AUTH_SECRET; NEXTAUTH_SECRET is a common alias in host dashboards.
 */
export function getAuthSecret(): string | undefined {
  const raw =
    process.env.AUTH_SECRET?.trim() ?? process.env.NEXTAUTH_SECRET?.trim();
  if (!raw) return undefined;
  const cleaned = stripSurroundingQuotes(raw).trim();
  return cleaned || undefined;
}
