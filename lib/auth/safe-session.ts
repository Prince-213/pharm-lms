import { cookies } from "next/headers";
import type { Session } from "next-auth";
import { auth } from "@/auth";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
] as const;

async function clearStaleSessionCookies() {
  try {
    const jar = await cookies();
    for (const name of SESSION_COOKIE_NAMES) {
      jar.delete(name);
    }
  } catch {
    // cookies() unavailable outside a request — ignore
  }
}

/**
 * Returns the current session, or null when unauthenticated.
 * Stale cookies (e.g. after AUTH_SECRET rotation) are cleared instead of
 * throwing JWTSessionError on public/marketing pages.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    return session;
  } catch (error) {
    await clearStaleSessionCookies();
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[auth] session decode failed; treating as logged out:", message);
    return null;
  }
}
