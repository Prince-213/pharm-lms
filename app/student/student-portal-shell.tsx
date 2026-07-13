"use client";

import { usePathname } from "next/navigation";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { studentPortalConfig } from "@/components/layout/nav/portal-nav-config";

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "";
  const trimmed = pathname.replace(/\/$/, "");
  return trimmed.length === 0 ? "/" : trimmed;
}

export function StudentPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const isAuthRoute = path === "/student/login" || path === "/student/signup";

  const isLearningPlayer = /^\/student\/course\/[^/]+$/.test(path);
  const isCertificatePage = /^\/student\/course\/[^/]+\/certificate$/.test(
    path,
  );

  if (isAuthRoute) return children;

  if (isLearningPlayer || isCertificatePage) return <>{children}</>;

  return (
    <DashboardAppShell
      config={studentPortalConfig}
      subtitle="Browse the catalog, read course pages, enroll, and learn section by section."
    >
      {children}
    </DashboardAppShell>
  );
}
