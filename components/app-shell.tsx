"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  ChevronRight,
  Bell,
  X,
  GraduationCap,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

export type AppShellNavItem = {
  href: string;
  label: string;
  icon?: any;
};

type AppShellProps = {
  title: string;
  subtitle: string;
  nav: AppShellNavItem[];
  children: React.ReactNode;
  homeHref?: string;
};

export function AppShell({
  title,
  nav,
  children,
  homeHref = "/",
}: AppShellProps) {
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
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-[#022c22] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 dark:bg-gray-dark",
          mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-18.5 items-center justify-between px-8 shrink-0">
            <Link href={homeHref} className="font-display text-xl font-bold uppercase tracking-wider text-white">
              PharmLMS
            </Link>
            <button 
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden p-1 text-emerald-400/60 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/40">
              Navigation
            </p>
            <nav className="space-y-1">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all duration-200",
                      active
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                        : "text-emerald-50/50 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon && <item.icon className={cn("h-4.5 w-4.5", active ? "text-emerald-400" : "text-emerald-50/20")} />}
                      <p>{item.label}</p>
                    </div>
                    {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-6 mt-auto">
            <div className="rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-5 text-center">
               <GraduationCap className="mx-auto mb-2 h-6 w-6 text-emerald-400/60" />
               <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-50/40">Pharmacy Academy</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-18.5 items-center justify-between border-b border-[var(--border)] bg-white/70 px-4 backdrop-blur-xl lg:px-10 dark:bg-gray-dark/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)] rounded-xl transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-black tracking-tight text-[var(--foreground)] sm:text-lg">
                {title}
              </h1>
              <p className="hidden text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] sm:block">
                Portal Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
             <button className="relative p-2.5 text-[var(--muted)] hover:bg-[var(--surface-muted)] rounded-xl transition-all hover:scale-105 active:scale-95">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-500/20"></span>
            </button>
            <div className="h-8 w-px bg-[var(--border)]/60 mx-1 hidden sm:block"></div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-12">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
