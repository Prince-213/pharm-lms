"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CourseLessonNav = {
  prevHref: string | null;
  nextHref: string | null;
  prevTitle?: string | null;
  nextTitle?: string | null;
  lessonIndex?: number;
  totalLessons?: number;
};

type CourseLessonNavGroupProps = CourseLessonNav & {
  variant?: "bar" | "sidebar";
  className?: string;
};

function NavSlot({
  href,
  label,
  direction,
  variant,
  disabled,
}: {
  href: string | null;
  label: string;
  direction: "prev" | "next";
  variant: "bar" | "sidebar";
  disabled: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const isBar = variant === "bar";
  const shortLabel = direction === "prev" ? "Prev" : "Next";

  const shared = cn(
    "inline-flex flex-col items-center justify-center transition active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1",
    isBar
      ? "min-w-[3.25rem] gap-0.5 px-2 py-1.5 sm:min-w-[3.5rem]"
      : "h-9 min-w-0 flex-1 flex-row gap-1.5 px-2 sm:px-3",
    disabled
      ? "pointer-events-none text-slate-300"
      : direction === "next" && !isBar
        ? "text-[var(--primary-strong)] hover:bg-[var(--primary-soft)]/40"
        : "text-slate-600 hover:bg-slate-100/80",
    direction === "next" && isBar && !disabled
      ? "text-[var(--primary-strong)] hover:bg-[var(--primary-soft)]/30"
      : null,
  );

  const content = (
    <>
      <Icon className={isBar ? "h-5 w-5" : "h-4 w-4 shrink-0"} aria-hidden />
      {isBar ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
          {shortLabel}
        </span>
      ) : (
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wide">
          {direction === "prev" ? "Previous" : "Next"}
        </span>
      )}
    </>
  );

  if (!href || disabled) {
    return (
      <span className={shared} aria-hidden={disabled}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={shared} aria-label={label}>
      {content}
    </Link>
  );
}

export function CourseLessonNavGroup({
  prevHref,
  nextHref,
  prevTitle,
  nextTitle,
  lessonIndex,
  totalLessons,
  variant = "bar",
  className,
}: CourseLessonNavGroupProps) {
  const hasPrev = Boolean(prevHref);
  const hasNext = Boolean(nextHref);
  const showPosition =
    lessonIndex != null &&
    totalLessons != null &&
    totalLessons > 0;

  if (!hasPrev && !hasNext && !showPosition) return null;

  const prevLabel = prevTitle
    ? `Previous lesson: ${prevTitle}`
    : "Previous lesson";
  const nextLabel = nextTitle ? `Next lesson: ${nextTitle}` : "Next lesson";

  if (variant === "bar") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-xl border border-slate-200/90 bg-white p-0.5 shadow-sm",
          className,
        )}
        role="group"
        aria-label="Lesson navigation"
      >
        <NavSlot
          href={prevHref}
          label={prevLabel}
          direction="prev"
          variant="bar"
          disabled={!hasPrev}
        />
        <span className="h-8 w-px shrink-0 bg-slate-200" aria-hidden />
        {showPosition ? (
          <>
            <div
              className="flex min-w-[2.75rem] flex-col items-center justify-center px-1.5 py-1"
              aria-label={`Lesson ${lessonIndex} of ${totalLessons}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                Lesson
              </span>
              <span className="mt-0.5 text-xs font-black tabular-nums text-slate-700 leading-none">
                {lessonIndex}
                <span className="font-semibold text-slate-300">/</span>
                {totalLessons}
              </span>
            </div>
            <span className="h-8 w-px shrink-0 bg-slate-200" aria-hidden />
          </>
        ) : null}
        <NavSlot
          href={nextHref}
          label={nextLabel}
          direction="next"
          variant="bar"
          disabled={!hasNext}
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showPosition ? (
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Lesson{" "}
          <span className="tabular-nums text-slate-600">{lessonIndex}</span>
          <span className="text-slate-300"> / </span>
          <span className="tabular-nums text-slate-600">{totalLessons}</span>
        </p>
      ) : null}
      <div
        className="flex w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/50"
        role="group"
        aria-label="Lesson navigation"
      >
        <NavSlot
          href={prevHref}
          label={prevLabel}
          direction="prev"
          variant="sidebar"
          disabled={!hasPrev}
        />
        <span className="w-px shrink-0 self-stretch bg-slate-200" aria-hidden />
        <NavSlot
          href={nextHref}
          label={nextLabel}
          direction="next"
          variant="sidebar"
          disabled={!hasNext}
        />
      </div>
    </div>
  );
}
