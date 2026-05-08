"use client";

import { clsx } from "clsx";
import {
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

const items = [
  { href: "/mentor/performance/overview", label: "Overview", icon: Gauge },
  { href: "/mentor/performance/revenue", label: "Revenue", icon: Wallet },
  { href: "/mentor/performance/students", label: "Students", icon: Users },
  {
    href: "/mentor/performance/reviews",
    label: "Reviews",
    icon: MessageSquareQuote,
  },
  {
    href: "/mentor/performance/engagement",
    label: "Engagement",
    icon: BarChart3,
  },
  {
    href: "/mentor/performance/traffic-and-conversion",
    label: "Traffic & conversion",
    icon: MousePointerClick,
  },
] as const;

export function PerformanceNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#e3e5e8] bg-[#f3f4f6] lg:w-[220px] lg:border-b-0 lg:border-r">
      <div className="border-b border-[#e3e5e8] px-4 py-4 sm:px-5 sm:py-6">
        <h2 className="text-lg font-bold tracking-tight text-[#1c1d1f]">
          Performance
        </h2>
        <p className="mt-1 text-xs leading-snug text-[#6a6f73]">
          Insights across revenue, learners, and content.
        </p>
      </div>
      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:p-3 [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/mentor/performance/overview" &&
              pathname === "/mentor/performance");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:gap-3 sm:py-2.5 lg:w-full",
                active
                  ? "bg-white text-[#1c1d1f] shadow-sm ring-1 ring-[#e3e5e8]"
                  : "text-[#3e4143] hover:bg-white/70 hover:text-[#1c1d1f]",
              )}
            >
              <Icon
                className={clsx(
                  "h-4 w-4 shrink-0",
                  active ? "text-[var(--primary)]" : "text-[#6a6f73]",
                )}
                strokeWidth={2}
              />
              <span className="leading-tight">{label}</span>
              {label === "Traffic & conversion" ? (
                <span className="ml-auto rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                  New
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#e3e5e8] p-4">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
          <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          <p className="text-[11px] leading-snug text-[#1c1d1f]">
            Connect payouts &amp; enrollments to unlock live charts.
          </p>
        </div>
      </div>
    </aside>
  );
}
