import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/enums";
import { canAccessRolePath, roleHomePath } from "@/lib/rbac";

const protectedPrefixes = ["/mentor", "/student", "/admin"];

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
 * Use Auth.js `auth()` so session resolution matches `/api/auth` and server `auth()`.
 * Manual `getToken()` can diverge in production (e.g. Edge env / secret handling).
 */
export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname;
  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = isPublicAuthPath(pathname);

  const user = req.auth?.user;
  const userRole = (user?.role as UserRole | undefined) ?? null;

  if (!user && needsAuth && !isAuthPage) {
    const loginPath = pathname.startsWith("/admin")
      ? "/admin/login"
      : pathname.startsWith("/mentor")
        ? "/mentor/login"
        : "/student/login";

    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  if (userRole && needsAuth && !canAccessRolePath(userRole, pathname)) {
    return NextResponse.redirect(new URL(roleHomePath(userRole), req.url));
  }

  if (userRole && isAuthPage) {
    return NextResponse.redirect(new URL(roleHomePath(userRole), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mentor/:path*", "/student/:path*", "/admin/:path*"],
};
