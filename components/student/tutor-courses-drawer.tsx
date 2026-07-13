"use client";

import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import type { TutorCourseCard } from "@/lib/student/load-instructor-profile";
import { cn } from "@/lib/utils";

type TutorCoursesDrawerProps = {
  tutorName: string;
  courses: TutorCourseCard[];
  triggerLabel?: string;
  triggerClassName?: string;
  /** Controlled open (optional). */
  defaultOpen?: boolean;
};

function CourseRow({ course }: { course: TutorCourseCard }) {
  const thumb = course.thumbnailUrl?.trim();
  const price = formatMinorUnitsToCurrency(
    course.priceMinorUnits,
    course.priceCurrency,
    { zeroAsFree: true },
  );
  const href = course.isEnrolled
    ? `/student/course/${course.id}`
    : `/student/browse/${course.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors",
        "hover:border-[var(--primary)]/35 hover:bg-[var(--primary-soft)]/10",
      )}
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            sizes="96px"
            unoptimized={thumb.startsWith("http")}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--ink-deep)]">
          {course.title}
        </p>
        {course.subtitle?.trim() ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {course.subtitle.trim()}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[var(--primary)]">{price}</span>
          <span className="text-muted-foreground">
            {course.learnerCount.toLocaleString()} learners
          </span>
          {course.isEnrolled ? (
            <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary-soft-text)]">
              Enrolled
            </span>
          ) : null}
        </div>
      </div>
      <ChevronRight
        className="mt-2 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}

export function TutorCoursesDrawer({
  tutorName,
  courses,
  triggerLabel = "Browse all courses",
  triggerClassName,
  defaultOpen = false,
}: TutorCoursesDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const enrolled = courses.filter((c) => c.isEnrolled);
  const catalog = courses.filter((c) => !c.isEnrolled);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--primary)] bg-transparent px-4 py-2.5 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--primary-soft)]/30"
          }
        >
          <GraduationCap className="h-4 w-4" aria-hidden />
          {triggerLabel}
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[min(88vh,720px)] overflow-hidden rounded-t-2xl border-[var(--border)] bg-[var(--surface)] p-0 sm:max-h-[85vh]"
      >
        <div className="mx-auto w-full max-w-2xl px-5 pb-8 pt-2">
          <SheetHeader className="border-b border-[var(--border-subtle)] pb-4 text-left">
            <SheetTitle className="font-display text-lg text-[var(--ink-deep)]">
              {tutorName}&apos;s courses
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Tap a course to open your overview or explore the catalog.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 max-h-[min(60vh,520px)] space-y-6 overflow-y-auto pr-1">
            {enrolled.length > 0 ? (
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Your enrollments
                </h3>
                <ul className="mt-3 space-y-2">
                  {enrolled.map((c) => (
                    <li key={c.id}>
                      <CourseRow course={c} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {catalog.length > 0 ? (
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {enrolled.length > 0 ? "More from this tutor" : "Published courses"}
                </h3>
                <ul className="mt-3 space-y-2">
                  {catalog.map((c) => (
                    <li key={c.id}>
                      <CourseRow course={c} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {courses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No published courses yet.
              </p>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
