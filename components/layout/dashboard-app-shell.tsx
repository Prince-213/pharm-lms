"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DashboardSiteHeader } from "@/components/layout/dashboard-site-header";
import { PortalAppSidebar } from "@/components/layout/portal-app-sidebar";
import {
  navItemsForTitle,
  type PortalNavConfig,
} from "@/components/layout/nav/portal-nav-config";
import { PortalDataSync } from "@/components/system/portal-data-sync";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { shellHeaderTitleFromNav } from "@/lib/shell-header-title";
import { cn } from "@/lib/utils";

type DashboardAppShellProps = {
  config: PortalNavConfig;
  subtitle?: string;
  children: React.ReactNode;
};

export function DashboardAppShell({
  config,
  subtitle,
  children,
}: DashboardAppShellProps) {
  const pathname = usePathname();

  const headerTitle = useMemo(
    () =>
      shellHeaderTitleFromNav(
        pathname,
        navItemsForTitle(config),
        config.portalTitle,
      ),
    [pathname, config],
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <PortalDataSync />
      <PortalAppSidebar config={config} />
      <SidebarInset>
        <DashboardSiteHeader title={headerTitle} subtitle={subtitle} />
        <main
          className={cn(
            "flex flex-1 flex-col gap-4 overflow-y-auto bg-[#f7f9fa] p-4 sm:p-6 lg:p-8",
          )}
        >
          <div
            className={cn(
              "mx-auto w-full min-w-0",
              config.maxContentWidth ?? "max-w-[1400px]",
            )}
          >
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
