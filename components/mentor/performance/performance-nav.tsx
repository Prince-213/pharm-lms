"use client";

import {
  Banknote,
  BarChart3,
  Gauge,
  MessageSquareQuote,
  MousePointerClick,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/tutor/performance/overview", label: "Overview", icon: Gauge },
  { href: "/tutor/performance/revenue", label: "Revenue", icon: Wallet },
  { href: "/tutor/performance/payments", label: "Payments", icon: Banknote },
  { href: "/tutor/performance/students", label: "Students", icon: Users },
  {
    href: "/tutor/performance/reviews",
    label: "Reviews",
    icon: MessageSquareQuote,
  },
  {
    href: "/tutor/performance/engagement",
    label: "Engagement",
    icon: BarChart3,
  },
  {
    href: "/tutor/performance/traffic-and-conversion",
    label: "Traffic & conversion",
    icon: MousePointerClick,
  },
] as const;

export function PerformanceNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[var(--border)] bg-[var(--surface-muted)] lg:w-[220px] lg:border-b-0 lg:border-r">
      <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5 sm:py-6">
        <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
          Performance
        </h2>
        <p className="mt-1 text-xs leading-snug text-[var(--muted)]">
          Insights across revenue, learners, and content.
        </p>
      </div>
      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:p-3 [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/tutor/performance/overview" &&
              pathname === "/tutor/performance");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:gap-3 sm:py-2.5 lg:w-full",
                active
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]/80 hover:text-[var(--foreground)]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-[var(--primary)]" : "text-[var(--muted)]",
                )}
                strokeWidth={2}
              />
              <span className="leading-tight">{label}</span>
              {label === "Traffic & conversion" ? (
                <span className="ml-auto rounded bg-[var(--primary-soft)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary-strong)] ring-1 ring-[var(--primary)]/20">
                  New
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--primary-soft)]/35 px-3 py-2 ring-1 ring-[var(--border)]">
          <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          <p className="text-[11px] leading-snug text-[var(--foreground)]">
            Connect payouts &amp; enrollments to unlock live charts.
          </p>
        </div>
      </div>
    </aside>
  );
}
