"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Calendar,
  FolderOpen,
  Menu,
  MessageSquare,
  Wrench,
  ChevronRight,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { HeaderNotificationBell } from "@/components/notifications/header-notification-bell";

/** Tutor app lives under `/tutor`; `/mentor/*` redirects in next.config.ts */
const WORKSPACE = "/tutor";

function navLinkActive(
  pathname: string,
  href: string,
  activePrefix?: string,
): boolean {
  if (activePrefix) {
    return (
      pathname === activePrefix || pathname.startsWith(`${activePrefix}/`)
    );
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
];

export function MentorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-[#022c22] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 sm:w-64 dark:bg-gray-dark",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-18.5 items-center px-8">
            <Link
              href={`${WORKSPACE}/courses`}
              className="font-display text-xl font-bold uppercase tracking-wider text-white"
            >
              PharmLMS
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-widest text-emerald-400/60">
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
                        ? "bg-white/10 text-white"
                        : "text-emerald-50/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-colors", active ? "text-emerald-400" : "group-hover:text-emerald-400")} />
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-4 w-4 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>

            <p className="mb-4 mt-8 px-4 text-xs font-semibold uppercase tracking-widest text-emerald-400/60">
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
                        ? "bg-white/10 text-white"
                        : "text-emerald-50/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-colors", active ? "text-emerald-400" : "group-hover:text-emerald-400")} />
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-4 w-4 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 mt-auto">
            <div className="rounded-xl bg-white/5 p-4 py-6">
              <p className="text-xs font-medium text-emerald-50/40 italic text-center">Educator Hub</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-18.5 items-center justify-between border-b border-(--border) bg-white/80 px-4 backdrop-blur-md lg:px-8 dark:bg-gray-dark/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 text-(--muted) hover:bg-(--surface-muted) rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden sm:block">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-soft)" />
               <input 
                 type="text" 
                 placeholder="Search workspace..." 
                 className="h-10 w-64 rounded-full bg-(--surface-muted) pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-(--primary)/20 transition-all"
               />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <HeaderNotificationBell
              className="mr-1"
              bellButtonClassName="rounded-full p-2 text-(--muted) hover:bg-(--surface-muted)"
            />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
