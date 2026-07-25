/** Human-readable copy when an email is already registered. */

export function messageForExistingEmail(params: {
  passwordHash: string | null;
  providers: string[];
}): string {
  const oauth = params.providers.filter((p) => p === "google" || p === "apple");
  const hasPassword = Boolean(params.passwordHash);

  if (!hasPassword && oauth.length > 0) {
    const label =
      oauth.length === 1
        ? oauth[0] === "apple"
          ? "Apple"
          : "Google"
        : oauth.map((p) => (p === "apple" ? "Apple" : "Google")).join(" or ");
    return `This email is already connected to a ${label} account. Sign in with ${label} instead.`;
  }

  if (hasPassword && oauth.length > 0) {
    return "An account with that email already exists. Sign in with your password or Google/Apple.";
  }

  return "An account with that email already exists. Sign in instead.";
}

export function messageForOauthOnlyLogin(providers: string[]): string {
  const oauth = providers.filter((p) => p === "google" || p === "apple");
  if (oauth.length === 0) {
    return "This account has no password. Use the social sign-in option you registered with.";
  }
  const label =
    oauth.length === 1
      ? oauth[0] === "apple"
        ? "Apple"
        : "Google"
      : "Google or Apple";
  return `This email is connected to a ${label} account. Sign in with ${label} instead of a password.`;
}

export function messageForAuthJsError(error: string | undefined): string | null {
  if (!error) return null;
  switch (error) {
    case "OAuthAccountNotLinked":
      return "This email is already connected to an account. Sign in with your email and password, then link your social account from settings.";
    case "AccessDenied":
      return "Sign-in was denied. Try again or use a different method.";
    case "Configuration":
      return "Sign-in is temporarily unavailable. Please try again later.";
    case "Verification":
      return "The sign-in link is invalid or has expired. Try again.";
    case "OAuthCallback":
    case "OAuthSignin":
    case "Callback":
      return "Social sign-in failed. Please try again.";
    case "Default":
      return "Something went wrong during sign-in. Please try again.";
    default:
      return "Something went wrong during sign-in. Please try again.";
  }
}
