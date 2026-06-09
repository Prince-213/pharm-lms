"use client";

import {
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  type AppIcon,
} from "@/lib/icons/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserMenu } from "@/auth/user-menu";
import { HeaderNotificationBell } from "@/components/notifications/header-notification-bell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { shellHeaderTitleFromNav } from "@/lib/shell-header-title";
import { cn } from "@/lib/utils";

export type AppShellNavItem = {
  href: string;
  label: string;
  icon?: AppIcon;
};

export type AppShellNavGroup = {
  label: string;
  items: AppShellNavItem[];
};

type AppShellProps = {
  title: string;
  subtitle: string;
  /** Flat nav (single "Navigation" group). Ignored if `navGroups` is set. */
  nav?: AppShellNavItem[];
  /** Grouped sidebar (e.g. Workspace / Personal). Takes precedence over `nav`. */
  navGroups?: AppShellNavGroup[];
  children: React.ReactNode;
  homeHref?: string;
};

function navLinkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  title,
  subtitle,
  nav = [],
  navGroups,
  children,
  homeHref = "/",
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const flatNavItems = useMemo(() => {
    if (navGroups && navGroups.length > 0) {
      return navGroups.flatMap((g) => g.items);
    }
    return nav;
  }, [navGroups, nav]);

  const headerTitle = useMemo(
    () =>
      flatNavItems.length > 0
        ? shellHeaderTitleFromNav(pathname, flatNavItems, title)
        : title,
    [pathname, flatNavItems, title],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Close mobile nav when the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default border-0 bg-black/50 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--header)] text-[var(--header-fg)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
          mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-18.5 shrink-0 items-center justify-between px-8">
            <Link
              href={homeHref}
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

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            {navGroups && navGroups.length > 0 ? (
              navGroups.map((group) => (
                <div key={group.label} className="mb-6 last:mb-0">
                  <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--header-fg-muted)]">
                    {group.label}
                  </p>
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const active = navLinkActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
                            active
                              ? "bg-[var(--header-fg)]/10 text-[var(--header-fg)] shadow-sm ring-1 ring-[var(--header-fg)]/10"
                              : "text-[var(--header-fg-muted)] hover:bg-[var(--header-fg)]/5 hover:text-[var(--header-fg)]",
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {item.icon && (
                              <item.icon
                                className={cn(
                                  "h-4.5 w-4.5",
                                  active
                                    ? "text-[var(--primary-soft)]"
                                    : "text-[var(--header-fg-muted)]",
                                )}
                              />
                            )}
                            <p>{item.label}</p>
                          </div>
                          {active && (
                            <ChevronRight className="ml-auto h-3.5 w-3.5 text-[var(--primary-soft)]" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))
            ) : (
              <>
                <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--header-fg-muted)]">
                  Navigation
                </p>
                <nav className="space-y-1">
                  {nav.map((item) => {
                    const active = navLinkActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
                          active
                            ? "bg-[var(--header-fg)]/10 text-[var(--header-fg)] shadow-sm ring-1 ring-[var(--header-fg)]/10"
                            : "text-[var(--header-fg-muted)] hover:bg-[var(--header-fg)]/5 hover:text-[var(--header-fg)]",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {item.icon && (
                            <item.icon
                              className={cn(
                                "h-4.5 w-4.5",
                                active
                                  ? "text-[var(--primary-soft)]"
                                  : "text-[var(--header-fg-muted)]",
                              )}
                            />
                          )}
                          <p>{item.label}</p>
                        </div>
                        {active && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-[var(--primary-soft)]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </>
            )}
          </div>

          <div className="mt-auto p-6">
            <Card className="border-[var(--header-fg)]/10 bg-gradient-to-br from-[var(--header-fg)]/10 to-transparent text-center text-[var(--header-fg)] shadow-none">
              <CardContent className="p-5">
                <GraduationCap className="mx-auto mb-2 h-6 w-6 text-[var(--primary-soft)]/80" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--header-fg-muted)]">
                  Pharmacy Academy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-18.5 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/70 px-4 backdrop-blur-xl lg:px-10">
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
            <div className="min-w-0 flex flex-col">
              <h1 className="truncate text-base font-black tracking-tight text-[var(--foreground)] sm:text-lg">
                {headerTitle}
              </h1>
              <p className="hidden text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <HeaderNotificationBell />
            <div className="h-8 w-px bg-[var(--border)]/60 mx-1 hidden sm:block"></div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-12">
          <div className="mx-auto min-w-0 max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
