import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/generated/prisma/enums";
import { canAccessRolePath, roleHomePath } from "@/lib/rbac";

const protectedPrefixes = ["/mentor", "/student", "/admin"];
const publicAuthPaths = ["/mentor/login", "/student/login", "/admin/login"];

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = publicAuthPaths.includes(pathname);

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const userRole = (token?.role as UserRole | undefined) ?? null;

  if (!token && needsAuth && !isAuthPage) {
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
}

export const config = {
  matcher: ["/mentor/:path*", "/student/:path*", "/admin/:path*"],
};
