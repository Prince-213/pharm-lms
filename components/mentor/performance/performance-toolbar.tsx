"use client";

import { Bell, Download } from "lucide-react";

type PerformanceToolbarProps = {
  title: string;
  subtitle?: string;
  showCourseFilter?: boolean;
  dateRangeLabel?: string;
};

export function PerformanceToolbar({
  title,
  subtitle,
  showCourseFilter = true,
  dateRangeLabel = "Last 12 months",
}: PerformanceToolbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-6 border-b border-[#ececec] pb-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3 gap-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
            {title}
          </h1>
          {showCourseFilter ? (
            <label className="inline-flex items-center gap-1.5">
              <span className="sr-only">Course scope</span>
              <select className="h-9 max-w-[220px] cursor-pointer truncate rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20">
                <option>All courses</option>
                <option>Published only</option>
                <option>Drafts</option>
              </select>
            </label>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
        <label className="sr-only" htmlFor="perf-date-range">
          Date range
        </label>
        <select
          id="perf-date-range"
          className="h-9 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          defaultValue="12m"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="12m">Date range: {dateRangeLabel}</option>
        </select>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Export
        </button>
        <div className="hidden h-6 w-px bg-[var(--border)] sm:block" aria-hidden />
        <button
          type="button"
          className="hidden h-9 items-center justify-center rounded-md border border-[var(--border)] bg-white px-2 text-[#3e4143] shadow-sm sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
