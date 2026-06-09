"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Menu,
  X,
  type AppIcon,
} from "@/lib/icons/client";
import { useState, useEffect } from "react";
import { LogoutButton } from "@/auth/logout-button";

export type NavItem = {
  href: string;
  label: string;
  icon: AppIcon;
};

type DashboardShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
};

export function DashboardShell({
  children,
  navItems,
  title,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-[var(--header)] text-[var(--header-fg)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 sm:w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <Link
              href="/"
              className="font-display text-lg font-bold uppercase tracking-wider"
            >
              PharmLMS
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--primary)] text-white shadow-sm"
                          : "text-[var(--header-fg-muted)] hover:bg-white/5 hover:text-[var(--header-fg)]",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          active
                            ? "text-white"
                            : "text-[var(--header-fg-muted)]",
                        )}
                      />
                      {item.label}
                      {active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User / Logout */}
          <div className="border-t border-white/10 p-4">
            <LogoutButton
              variant="onDark"
              className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-[var(--header-fg-muted)] hover:bg-white/5 hover:text-[var(--header-fg)]"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-[var(--foreground)] hidden sm:block">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Can add notifications/profile here like the template */}
            <div className="h-8 w-8 rounded-full bg-[var(--primary-soft)] flex items-center justify-center text-[var(--primary)] font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
