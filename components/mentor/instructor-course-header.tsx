"use client";

import { Eye, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function InstructorCourseHeader({
  courseId,
  courseTitle,
  statusLabel,
  readOnly = false,
  showReview = true,
  topMeta,
  settingsHref,
  onMenuClick,
}: {
  courseId?: string;
  courseTitle: string;
  statusLabel: string;
  readOnly?: boolean;
  showReview?: boolean;
  topMeta?: string;
  settingsHref?: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-12 w-full max-w-[1280px] items-center gap-2 px-3 sm:px-4 lg:h-12">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] lg:hidden"
            aria-label="Open course menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
          <Link
            href="/tutor/courses"
            className="hidden shrink-0 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] lg:inline"
          >
            {"<"} Back to courses
          </Link>
          <span
            className="hidden h-4 w-px shrink-0 bg-[var(--border)] lg:block"
            aria-hidden
          />
          <h1 className="min-w-0 truncate text-sm font-semibold text-[var(--foreground)] lg:text-base">
            {courseTitle}
          </h1>
          <span className="shrink-0 rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            {statusLabel}
          </span>
          {topMeta ? (
            <span className="hidden truncate text-xs text-[var(--muted)] xl:inline">
              {topMeta}
            </span>
          ) : null}
          {readOnly ? (
            <span className="hidden text-xs font-medium text-[var(--warning-star)] lg:inline">
              Locked
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {showReview && courseId ? (
            <Link
              href={`/tutor/courses/${courseId}/preview`}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]",
                "h-9 w-9 lg:h-auto lg:w-auto lg:px-3 lg:py-1",
              )}
              aria-label="Preview course"
            >
              <Eye className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden text-xs font-semibold lg:inline">
                Review
              </span>
            </Link>
          ) : null}
          {settingsHref ? (
            <Link
              href={settingsHref}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              aria-label="Course settings"
            >
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>

      {readOnly ? (
        <p className="border-t border-amber-200/60 bg-amber-50/80 px-3 py-2 text-center text-xs font-medium text-amber-900 lg:hidden">
          Editing is locked while this course is under review or published.
        </p>
      ) : null}
    </header>
  );
}
