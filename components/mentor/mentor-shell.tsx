"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  FolderOpen,
  Menu,
  MessageSquare,
  UserCircle,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { HeaderNotificationBell } from "@/components/notifications/header-notification-bell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { shellHeaderTitleFromNav } from "@/lib/shell-header-title";
import { cn } from "@/lib/utils";

/** Tutor workspace routes use `/tutor/*` (see proxy RBAC: only MENTOR may use `/mentor/*`). */
const WORKSPACE = "/tutor";

function navLinkActive(
  pathname: string,
  href: string,
  activePrefix?: string,
): boolean {
  if (activePrefix) {
    return pathname === activePrefix || pathname.startsWith(`${activePrefix}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ShellNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When set, any path under this prefix counts as active (e.g. performance sub-pages). */
  activePrefix?: string;
};

const mainNav: ShellNavItem[] = [
  { href: `${WORKSPACE}/courses`, label: "Courses", icon: BookOpen },
  {
    href: `${WORKSPACE}/communication`,
    label: "Communication",
    icon: MessageSquare,
  },
  {
    href: `${WORKSPACE}/performance/overview`,
    label: "Performance",
    icon: BarChart3,
    activePrefix: `${WORKSPACE}/performance`,
  },
  { href: `${WORKSPACE}/assignments`, label: "Tools", icon: Wrench },
];

const bottomNav: ShellNavItem[] = [
  { href: `${WORKSPACE}/students`, label: "Resources", icon: FolderOpen },
  { href: `${WORKSPACE}/meetings`, label: "Meetings", icon: Calendar },
  { href: `${WORKSPACE}/payouts`, label: "Payouts", icon: Wallet },
  { href: `${WORKSPACE}/profile`, label: "Profile", icon: UserCircle },
];

export function MentorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const headerTitle = useMemo(
    () =>
      shellHeaderTitleFromNav(pathname, [...mainNav, ...bottomNav], "Tutor"),
    [pathname],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Close mobile nav when the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default border-0 bg-black/50 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--header)] text-[var(--header-fg)] transition-transform duration-300 sm:w-64 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
          mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-18.5 shrink-0 items-center justify-between px-8">
            <Link
              href={`${WORKSPACE}/courses`}
              className="font-display text-xl font-bold uppercase tracking-wider text-[var(--header-fg)]"
            >
              PharmLMS
            </Link>
            <Button
              type="button"
              variant="sidebarIcon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-widest text-[var(--header-fg-muted)]">
              Workspace
            </p>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = navLinkActive(
                  pathname,
                  item.href,
                  item.activePrefix,
                );
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-[var(--header-fg)]/10 text-[var(--header-fg)]"
                        : "text-[var(--header-fg-muted)] hover:bg-[var(--header-fg)]/5 hover:text-[var(--header-fg)]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active
                          ? "text-[var(--primary-soft)]"
                          : "text-[var(--header-fg-muted)] group-hover:text-[var(--primary-soft)]",
                      )}
                    />
                    {item.label}
                    {active && (
                      <ChevronRight className="ml-auto h-4 w-4 text-[var(--primary-soft)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <p className="mb-4 mt-8 px-4 text-xs font-semibold uppercase tracking-widest text-[var(--header-fg-muted)]">
              Personal
            </p>
            <nav className="space-y-1">
              {bottomNav.map((item) => {
                const Icon = item.icon;
                const active = navLinkActive(
                  pathname,
                  item.href,
                  item.activePrefix,
                );
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-[var(--header-fg)]/10 text-[var(--header-fg)]"
                        : "text-[var(--header-fg-muted)] hover:bg-[var(--header-fg)]/5 hover:text-[var(--header-fg)]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active
                          ? "text-[var(--primary-soft)]"
                          : "text-[var(--header-fg-muted)] group-hover:text-[var(--primary-soft)]",
                      )}
                    />
                    {item.label}
                    {active && (
                      <ChevronRight className="ml-auto h-4 w-4 text-[var(--primary-soft)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <Card className="border-[var(--header-fg)]/10 bg-[var(--header-fg)]/5 text-center text-[var(--header-fg)] shadow-none">
              <CardContent className="p-4 py-6">
                <p className="text-xs font-medium italic text-[var(--header-fg-muted)]">
                  Educator Hub
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-18.5 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
            <Button
              type="button"
              variant="chrome"
              className="shrink-0 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="min-w-0 truncate text-base font-bold tracking-tight text-[var(--foreground)] sm:text-lg">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderNotificationBell
              className="mr-1"
              bellButtonClassName="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
