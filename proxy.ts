import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/generated/prisma/enums";
import { getAuthSecret } from "@/lib/auth/secret";
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

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = isPublicAuthPath(pathname);

  const token = await getToken({
    req,
    secret: getAuthSecret(),
    secureCookie: req.nextUrl.protocol === "https:",
  });

  const userRole = (token?.role as UserRole | undefined) ?? null;

  if (!token && needsAuth && !isAuthPage) {
    const loginPath = loginPathForPathname(pathname);
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  if (userRole && needsAuth && !canAccessRolePath(userRole, pathname)) {
    return NextResponse.redirect(new URL(roleHomePath(userRole), req.url));
  }

  if (userRole && isAuthPage) {
    const loginPath = normalizePathname(pathname);
    const userHome = roleHomePath(userRole);
    const userLoginPath = loginPathForPathname(userHome);
    if (normalizePathname(userLoginPath) === loginPath) {
      return NextResponse.redirect(new URL(userHome, req.url));
    }
    const signOutUrl = new URL("/api/auth/signout", req.url);
    signOutUrl.searchParams.set("callbackUrl", loginPath);
    return NextResponse.redirect(signOutUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mentor/:path*",
    "/tutor/:path*",
    "/student/:path*",
    "/admin/:path*",
  ],
};
