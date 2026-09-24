import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/generated/prisma/enums";
import { getAuthSecret } from "@/lib/auth/secret";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/session-cookies";
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

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
}

function expireSessionCookies(res: NextResponse): NextResponse {
  for (const name of SESSION_COOKIE_NAMES) {
    res.cookies.delete(name);
  }
  return res;
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

  let token = null;
  try {
    token = await getToken({
      req,
      secret: getAuthSecret(),
      secureCookie: req.nextUrl.protocol === "https:",
    });
  } catch {
    token = null;
  }

  const staleSession = hasSessionCookie(req) && !token?.sub;
  const userRole = (token?.role as UserRole | undefined) ?? null;

  if (!token?.sub && needsAuth && !isAuthPage) {
    const loginPath = loginPathForPathname(pathname);
    const redirect = NextResponse.redirect(new URL(loginPath, req.url));
    return staleSession ? expireSessionCookies(redirect) : redirect;
  }

  if (userRole && token?.sub && needsAuth && !canAccessRolePath(userRole, pathname)) {
    return NextResponse.redirect(new URL(roleHomePath(userRole), req.url));
  }

  if (userRole && token?.sub && isAuthPage) {
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

  const next = NextResponse.next();
  return staleSession ? expireSessionCookies(next) : next;
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/teach",
    "/become-a-mentor",
    "/contact",
    "/validate",
    "/courses/:path*",
    "/blog/:path*",
    "/legal/:path*",
    "/mentor/:path*",
    "/tutor/:path*",
    "/student/:path*",
    "/admin/:path*",
  ],
};
