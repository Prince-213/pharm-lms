import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/generated/prisma/enums";
import {
  authTraceEnabled,
  getAuthSecret,
  isAuthSecretConfigured,
} from "@/lib/auth/secret";
import { canAccessRolePath, roleHomePath } from "@/lib/rbac";

const protectedPrefixes = ["/mentor", "/tutor", "/student", "/admin"];

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
    p === "/tutor/login" ||
    p === "/tutor/signup" ||
    p === "/student/login" ||
    p === "/student/signup" ||
    p === "/admin/login"
  );
}

function loginPathForPathname(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin/login";
  if (pathname.startsWith("/mentor")) return "/mentor/login";
  if (pathname.startsWith("/tutor")) return "/tutor/login";
  return "/student/login";
}

/**
 * Next.js 16+ prefers the `proxy` export name. This file must stay `middleware.ts`
 * so Turbopack resolves the entry; `export default` satisfies the middleware-file validator.
 */
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = isPublicAuthPath(pathname);
  const secretConfigured = isAuthSecretConfigured();

  const token = await getToken({
    req,
    secret: getAuthSecret(),
  });

  const userRole = (token?.role as UserRole | undefined) ?? null;
  const hasJwt = Boolean(token);

  if (authTraceEnabled()) {
    console.info("[proxy]", {
      pathname,
      needsAuth,
      isAuthPage,
      hasJwt,
      secretConfigured,
      role: userRole ?? undefined,
      decision:
        !token && needsAuth && !isAuthPage
          ? "redirect_login"
          : userRole && needsAuth && !canAccessRolePath(userRole, pathname)
            ? "redirect_role_home"
            : userRole && isAuthPage
              ? "redirect_authed_away_from_auth_page"
              : "next",
    });
  } else if (process.env.NODE_ENV !== "production") {
    console.info("[proxy]", {
      pathname,
      hasJwt,
      secretConfigured,
    });
  }

  if (!token && needsAuth && !isAuthPage) {
    const loginPath = loginPathForPathname(pathname);
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  if (userRole && needsAuth && !canAccessRolePath(userRole, pathname)) {
    return NextResponse.redirect(new URL(roleHomePath(userRole), req.url));
  }

  if (userRole && isAuthPage) {
    return NextResponse.redirect(new URL(roleHomePath(userRole), req.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/mentor/:path*",
    "/tutor/:path*",
    "/student/:path*",
    "/admin/:path*",
  ],
};
