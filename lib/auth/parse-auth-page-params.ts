export type PortalAuthErrorKind = "wrong_portal" | "account_disabled";

export function parsePortalAuthError(
  authError: string | undefined,
): PortalAuthErrorKind | null {
  if (authError === "wrong_portal") return "wrong_portal";
  if (authError === "account_disabled") return "account_disabled";
  return null;
}

/** Auth.js uses `?error=Code` on the sign-in page. */
export function parseAuthJsError(error: string | undefined): string | null {
  if (!error || typeof error !== "string") return null;
  return error.slice(0, 64);
}
