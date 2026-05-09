/**
 * Auth.js accepts `AUTH_SECRET` or legacy `NEXTAUTH_SECRET`.
 * Use this everywhere we pass `secret` explicitly so we never override
 * inference with `undefined` for only one variable name.
 *
 * Trims whitespace and strips a single pair of surrounding quotes (common
 * when copying into Netlify / hosting env UIs).
 */
export function getAuthSecret(): string | undefined {
  const raw = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (raw == null) return undefined;
  let s = raw.trim();
  if (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'")))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.length > 0 ? s : undefined;
}
