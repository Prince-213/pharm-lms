"use client";

import { usePathname } from "next/navigation";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { adminPortalConfig } from "@/components/layout/nav/portal-nav-config";

export function AdminPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/admin/login";

  if (isAuthRoute) return children;

  return (
    <DashboardAppShell config={adminPortalConfig}>{children}</DashboardAppShell>
  );
}
