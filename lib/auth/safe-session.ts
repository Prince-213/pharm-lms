import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { getAuthSecret } from "@/lib/auth/secret";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/session-cookies";

async function cookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .filter((cookie) => cookie.value)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return SESSION_COOKIE_NAMES.some((name) => Boolean(jar.get(name)?.value));
}

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
 * Skips Auth.js when no session cookie is present. If a cookie exists but
 * cannot be decrypted (AUTH_SECRET rotation), returns null without calling
 * auth() so JWTSessionError is not logged on public pages.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    if (!(await hasSessionCookie())) return null;

    const token = await getToken({
      req: { headers: { cookie: await cookieHeader() } },
      secret: getAuthSecret(),
    });
    if (!token?.sub) return null;

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
