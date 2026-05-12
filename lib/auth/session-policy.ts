/** Max JWT/session lifetime (seconds). Typical web app default (~30 days). */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Client-side inactivity after which we sign out (ms).
 * Separate from JWT expiry; keeps abandoned tabs from staying logged in indefinitely.
 */
export const IDLE_SIGN_OUT_MS = 24 * 60 * 60 * 1000;
