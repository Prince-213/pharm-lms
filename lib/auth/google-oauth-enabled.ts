/** Google OAuth is configured (server-side). Use to show the button and register the provider. */
export function isGoogleOAuthEnabled(): boolean {
  return !!(
    process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()
  );
}
