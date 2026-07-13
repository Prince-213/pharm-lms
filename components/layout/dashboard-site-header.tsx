"use client";

import { HeaderNotificationBell } from "@/components/notifications/header-notification-bell";
import { UserMenu } from "@/auth/user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardSiteHeaderProps = {
  title: string;
  subtitle?: string;
};

export function DashboardSiteHeader({
  title,
  subtitle,
}: DashboardSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
          {title}
        </h1>
        {subtitle ? (
          <p className="hidden truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:block">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <HeaderNotificationBell
          bellButtonClassName="rounded-full p-2 text-muted-foreground hover:bg-muted"
        />
        <UserMenu />
      </div>
    </header>
  );
}
