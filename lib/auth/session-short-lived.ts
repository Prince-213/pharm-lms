/** Max JWT/session lifetime (seconds) after each successful session refresh. */
export const SESSION_MAX_AGE_SECONDS = 30;

/** Client-side inactivity after which we sign out and clear auth cookies. */
export const IDLE_SIGN_OUT_MS = 30_000;
