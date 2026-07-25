"use client";

import { clsx } from "clsx";
import { BookPlus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CourseCardMenu } from "@/components/mentor/course-card-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { CourseStatus } from "@/generated/prisma/enums";
import { courseStatusLabel } from "@/lib/course-status-label";

export type TutorCourseRow = {
  id: string;
  title: string;
  status: CourseStatus;
  thumbnailUrl: string | null;
  purchaseCount: number;
  updatedAtIso: string;
};

type StatusFilterId =
  | "all"
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "published";

type SortId = "newest" | "oldest" | "title_asc" | "title_desc";

const STATUS_FILTERS: { id: StatusFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "submitted", label: "In review" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Needs revision" },
  { id: "published", label: "Live" },
];

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: "newest", label: "Newest updated" },
  { id: "oldest", label: "Oldest updated" },
  { id: "title_asc", label: "Title A–Z" },
  { id: "title_desc", label: "Title Z–A" },
];

function progressPercent(status: CourseStatus): number {
  switch (status) {
    case CourseStatus.PUBLISHED:
      return 100;
    case CourseStatus.APPROVED:
      return 92;
    case CourseStatus.SUBMITTED:
      return 72;
    case CourseStatus.REJECTED:
      return 48;
    case CourseStatus.DRAFT:
    default:
      return 36;
  }
}

function statusRibbon(status: CourseStatus): string {
  switch (status) {
    case CourseStatus.PUBLISHED:
      return "Live";
    case CourseStatus.SUBMITTED:
      return "In review";
    case CourseStatus.APPROVED:
      return "Approved";
    case CourseStatus.REJECTED:
      return "Needs revision";
    case CourseStatus.DRAFT:
    default:
      return "In production";
  }
}

function matchesStatusFilter(
  status: CourseStatus,
  filter: StatusFilterId,
): boolean {
  if (filter === "all") return true;
  if (filter === "draft") return status === CourseStatus.DRAFT;
  if (filter === "submitted") return status === CourseStatus.SUBMITTED;
  if (filter === "approved") return status === CourseStatus.APPROVED;
  if (filter === "rejected") return status === CourseStatus.REJECTED;
  if (filter === "published") return status === CourseStatus.PUBLISHED;
  return true;
}

function sortCourses(rows: TutorCourseRow[], sort: SortId): TutorCourseRow[] {
  const copy = [...rows];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) =>
          new Date(a.updatedAtIso).getTime() -
          new Date(b.updatedAtIso).getTime(),
      );
    case "title_asc":
      return copy.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    case "title_desc":
      return copy.sort((a, b) =>
        b.title.localeCompare(a.title, undefined, { sensitivity: "base" }),
      );
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.updatedAtIso).getTime() -
          new Date(a.updatedAtIso).getTime(),
      );
  }
}

export function TutorCoursesList({
  courses,
  firstCourseTitle,
}: {
  courses: TutorCourseRow[];
  firstCourseTitle: string | null;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>("all");
  const [sort, setSort] = useState<SortId>("newest");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = courses.filter((c) => {
      if (!matchesStatusFilter(c.status, statusFilter)) return false;
      if (!term) return true;
      const hay = `${c.title} ${statusRibbon(c.status)} ${courseStatusLabel(c.status)}`.toLowerCase();
      return hay.includes(term);
    });
    return sortCourses(matched, sort);
  }, [courses, search, statusFilter, sort]);

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookPlus}
        title="No courses yet"
        description="Create your first course with the studio wizard to start teaching on PharmLMS."
        actionHref="/tutor/courses/new/step-2"
        actionLabel="New course"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="relative min-w-0 flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your courses"
              className="h-11 w-full rounded-md border border-[#d1d7dc] bg-white py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <div className="relative min-w-[180px] sm:w-auto">
            <label htmlFor="tutor-courses-sort" className="sr-only">
              Sort courses
            </label>
            <select
              id="tutor-courses-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="h-11 w-full cursor-pointer appearance-none rounded-md border border-[#d1d7dc] bg-white pl-4 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            >
              ▾
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? courses.length
                : courses.filter((c) =>
                    matchesStatusFilter(c.status, f.id),
                  ).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  statusFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {f.label}
                <span
                  className={clsx(
                    "tabular-nums",
                    statusFilter === f.id
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-medium text-muted-foreground">
          Showing{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="tabular-nums">{courses.length}</span> courses
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            No courses match your search
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different keyword or clear your status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-4 text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          {filtered.map((course) => {
            const pct = progressPercent(course.status);
            const thumb = course.thumbnailUrl;
            return (
              <article
                key={course.id}
                className="flex flex-col overflow-hidden border border-[#d1d7dc] bg-white shadow-sm transition hover:border-primary/30 sm:flex-row"
              >
                <Link
                  href={`/tutor/courses/${course.id}/manage/curriculum`}
                  className="relative flex h-48 w-full shrink-0 bg-[#eceeef] sm:h-auto sm:w-64"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 px-4 text-center text-xs font-semibold text-slate-600">
                      {course.title.slice(0, 40)}
                    </div>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-extrabold text-foreground">
                        {course.title}
                      </h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {statusRibbon(course.status)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {courseStatusLabel(course.status)}
                      </p>
                    </div>
                    <CourseCardMenu
                      courseId={course.id}
                      courseTitle={course.title}
                      status={course.status}
                      hasSuccessfulPurchases={course.purchaseCount > 0}
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-end justify-between text-sm font-semibold">
                      <span className="text-foreground">
                        Finish your course
                      </span>
                      <span className="text-primary">{pct}% Complete</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <Link
                      href={`/tutor/courses/${course.id}/manage/curriculum`}
                      className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                    >
                      Edit course →
                    </Link>
                    <Link
                      href={`/tutor/courses/${course.id}/overview`}
                      className="mt-2 ml-3 inline-block text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Course overview →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center bg-muted px-8 py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-card text-2xl shadow-sm">
                💡
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Instructor insights
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Based on catalog trends, learners engage strongly with dosage
                calculations and patient safety modules. Consider sequencing
                those early in your next course.
              </p>
            </div>
            <div className="flex flex-col items-center bg-primary px-8 py-12 text-center text-primary-foreground">
              <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary-foreground/10 text-2xl shadow-lg">
                ✨
              </div>
              <h3 className="text-lg font-semibold">Certification prep</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
                {firstCourseTitle
                  ? `Publish "${firstCourseTitle}" to unlock student enrollments and completion analytics.`
                  : "Publish a course to unlock enrollments, completion analytics, and program badges."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
