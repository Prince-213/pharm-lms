/** Apple Sign In is configured (server-side). */
export function isAppleOAuthEnabled(): boolean {
  return !!(
    process.env.AUTH_APPLE_ID?.trim() &&
    process.env.AUTH_APPLE_SECRET?.trim()
  );
}
