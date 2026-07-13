"use client";

import { usePathname } from "next/navigation";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { tutorPortalConfig } from "@/components/layout/nav/portal-nav-config";

export function TutorPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/tutor/login" || pathname === "/tutor/signup";
  const isCourseStudioRoute =
    pathname.startsWith("/tutor/courses/new") ||
    /\/tutor\/courses\/[^/]+\/manage/.test(pathname) ||
    /\/tutor\/courses\/[^/]+\/preview/.test(pathname);

  if (isAuthRoute || isCourseStudioRoute) return children;

  return (
    <DashboardAppShell config={tutorPortalConfig}>{children}</DashboardAppShell>
  );
}
