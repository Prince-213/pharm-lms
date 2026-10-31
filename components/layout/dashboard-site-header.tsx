"use client";

import Link from "next/link";
import { UserMenu } from "@/auth/user-menu";
import { PharmLogo } from "@/components/brand/pharm-logo";
import { HeaderNotificationBell } from "@/components/notifications/header-notification-bell";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardSiteHeaderProps = {
  title: string;
  subtitle?: string;
  homeHref: string;
};

export function DashboardSiteHeader({
  title,
  subtitle,
  homeHref,
}: DashboardSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Link
        href={homeHref}
        className="mr-2 shrink-0"
        aria-label="PharmEdge home"
      >
        <PharmLogo
          markClassName="h-7 w-7"
          wordmarkClassName="hidden text-sm text-foreground sm:inline"
        />
      </Link>
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
        <HeaderNotificationBell bellButtonClassName="rounded-full p-2 text-muted-foreground hover:bg-muted" />
        <UserMenu />
      </div>
    </header>
  );
}
