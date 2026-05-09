import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/generated/prisma/enums";
import { getAuthSecret } from "@/lib/auth/secret";
import {
  canAccessRolePath,
  isTutorLegacyMentorAliasPath,
  roleHomePath,
} from "@/lib/rbac";

const protectedPrefixes = ["/mentor", "/student", "/admin"];

/** Logs in dev always; in production only if `PROXY_DEBUG=true` (or `1` / `yes`). */
function shouldLogProxy(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const v = process.env.PROXY_DEBUG?.toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function logProxy(decision: string, fields: Record<string, unknown>): void {
  if (!shouldLogProxy()) return;
  console.info("[proxy]", { decision, ...fields });
}

/** Paths where unauthenticated users may land; must include signup (not only login). */
function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/$/, "");
  return trimmed.length === 0 ? "/" : trimmed;
}

function isPublicAuthPath(pathname: string): boolean {
  const p = normalizePathname(pathname);
  return (
    p === "/mentor/login" ||
    p === "/mentor/signup" ||
    p === "/student/login" ||
    p === "/student/signup" ||
    p === "/admin/login"
  );
}

/**
 * Use `getToken` here (not `auth()` from `@/auth`) so the proxy bundle stays
 * Edge-safe. Importing `auth` pulls Prisma + full NextAuth into middleware and
 * can break Next.js 16 proxy with errors like "nextHandler is not a function".
 */
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = isPublicAuthPath(pathname);

  const secret = getAuthSecret();
  const token = await getToken({ req, secret });

  const userRole = (token?.role as UserRole | undefined) ?? null;
  const hasJwt = Boolean(token);

  const baseFields = {
    pathname,
    method: req.method,
    needsAuth,
    isAuthPage,
    hasJwt,
    userId: (token?.sub as string | undefined) ?? null,
    role: userRole ?? null,
    secretConfigured: Boolean(secret),
  };

  if (!token && needsAuth && !isAuthPage) {
    let loginPath: string;
    if (pathname.startsWith("/admin")) {
      loginPath = "/admin/login";
    } else if (pathname.startsWith("/mentor")) {
      // Tutor bookmarks / shared links use legacy /mentor/* URLs → tutor sign-in.
      loginPath = isTutorLegacyMentorAliasPath(pathname)
        ? "/tutor/login"
        : "/mentor/login";
    } else {
      loginPath = "/student/login";
    }

    logProxy("redirect_unauthenticated", {
      ...baseFields,
      loginPath,
      reason: "no_jwt_on_protected_route",
    });

    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  if (userRole && needsAuth && !canAccessRolePath(userRole, pathname)) {
    const home = roleHomePath(userRole);
    logProxy("redirect_role_mismatch", {
      ...baseFields,
      roleHomePath: home,
      reason: "user_role_cannot_access_path",
    });

    return NextResponse.redirect(new URL(home, req.url));
  }

  if (userRole && isAuthPage) {
    const home = roleHomePath(userRole);
    logProxy("redirect_from_auth_page", {
      ...baseFields,
      roleHomePath: home,
      reason: "already_signed_in",
    });

    return NextResponse.redirect(new URL(home, req.url));
  }

  logProxy("next", {
    ...baseFields,
    reason: "allow_request",
  });

  return NextResponse.next();
}

/** Default export for runtimes that expect it (named `proxy` is primary). */
export default proxy;

export const config = {
  matcher: ["/mentor/:path*", "/student/:path*", "/admin/:path*"],
};
