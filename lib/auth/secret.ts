/**
 * Auth.js accepts `AUTH_SECRET` or legacy `NEXTAUTH_SECRET`.
 * Use this everywhere we pass `secret` explicitly so we never override
 * inference with `undefined` for only one variable name.
 */
export function getAuthSecret(): string | undefined {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s?.length) return undefined;
  return s;
}
