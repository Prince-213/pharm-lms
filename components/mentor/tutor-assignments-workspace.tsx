"use client";

import { clsx } from "clsx";
import { ClipboardList, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AssignmentStatusPill } from "@/components/assignments/assignment-status-badges";
import { NewAssignmentForm } from "@/components/mentor/new-assignment-form";
import { AssignmentStatus } from "@/generated/prisma/enums";

export type TutorAssignmentRow = {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  status: AssignmentStatus;
  dueAtIso: string | null;
  createdAtIso: string;
  submissionCount: number;
};

type FilterId = "all" | "draft" | "sent" | "closed";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Open" },
  { id: "closed", label: "Closed" },
];

function rowMatchesFilter(row: TutorAssignmentRow, f: FilterId): boolean {
  if (f === "all") return true;
  if (f === "draft") return row.status === AssignmentStatus.DRAFT;
  if (f === "sent") return row.status === AssignmentStatus.SENT;
  if (f === "closed") return row.status === AssignmentStatus.CLOSED;
  return true;
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center shadow-[var(--shadow-sm)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

export function TutorAssignmentsWorkspace({
  courses,
  rows,
  unreadAlertCount = 0,
}: {
  courses: Array<{ id: string; title: string }>;
  rows: TutorAssignmentRow[];
  unreadAlertCount?: number;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const stats = useMemo(() => {
    let draft = 0;
    let sent = 0;
    let closed = 0;
    for (const r of rows) {
      if (r.status === AssignmentStatus.DRAFT) draft += 1;
      else if (r.status === AssignmentStatus.SENT) sent += 1;
      else if (r.status === AssignmentStatus.CLOSED) closed += 1;
    }
    return { total: rows.length, draft, sent, closed };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!rowMatchesFilter(r, filter)) return false;
      if (!term) return true;
      const hay = `${r.title} ${r.courseTitle}`.toLowerCase();
      return hay.includes(term);
    });
  }, [rows, filter, search]);

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Create assignments for your courses, manage drafts, and review
          submissions in one place.
        </p>
      </div>

      {unreadAlertCount > 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <span className="font-semibold tabular-nums">{unreadAlertCount}</span>{" "}
          unread {unreadAlertCount === 1 ? "alert" : "alerts"} — open an
          assignment below to review new submissions.
        </div>
      ) : null}

      <NewAssignmentForm courses={courses} />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <ClipboardList
            className="h-10 w-10 text-[var(--border)]"
            strokeWidth={1.25}
          />
          <p className="mt-4 text-sm font-semibold">No assignments yet</p>
          <p className="mt-2 max-w-sm text-xs text-[var(--muted)]">
            Use the composer above to create your first assignment.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Total" value={stats.total} />
            <StatTile label="Draft" value={stats.draft} />
            <StatTile label="Open" value={stats.sent} />
            <StatTile label="Closed" value={stats.closed} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative min-w-[200px] flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or course…"
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
              />
            </label>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    filter === f.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
              Your assignments ({rows.length})
            </h2>

            <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-3">Assignment</th>
                    <th className="px-3 py-3">Course</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Due</th>
                    <th className="px-3 py-3 text-right tabular-nums">
                      Submissions
                    </th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-[var(--muted)]"
                      >
                        No assignments match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-[var(--surface-muted)]/60"
                      >
                        <td className="px-3 py-3 font-semibold text-[var(--foreground)]">
                          <Link
                            href={`/tutor/assignments/${r.id}`}
                            className="text-[var(--primary)] hover:underline"
                          >
                            {r.title}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/tutor/courses/${r.courseId}/manage/curriculum`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                          >
                            {r.courseTitle}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <AssignmentStatusPill status={r.status} />
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted)] tabular-nums">
                          {r.dueAtIso
                            ? new Date(r.dueAtIso).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-right text-sm font-semibold tabular-nums text-[var(--foreground)]">
                          {r.submissionCount}
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted)] tabular-nums">
                          {new Date(r.createdAtIso).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {filtered.length === 0 ? (
                <li className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
                  No assignments match your filters.
                </li>
              ) : (
                filtered.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/tutor/assignments/${r.id}`}
                          className="text-base font-bold text-[var(--foreground)] hover:text-[var(--primary)]"
                        >
                          {r.title}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          <Link
                            href={`/tutor/courses/${r.courseId}/manage/curriculum`}
                            className="font-semibold text-[var(--primary)] hover:underline"
                          >
                            {r.courseTitle}
                          </Link>
                          {" · "}
                          {r.dueAtIso
                            ? `Due ${new Date(r.dueAtIso).toLocaleDateString()}`
                            : "No due date"}
                        </p>
                      </div>
                      <AssignmentStatusPill status={r.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                      <span>
                        Created {new Date(r.createdAtIso).toLocaleDateString()}
                      </span>
                      <span className="font-semibold tabular-nums text-[var(--foreground)]">
                        {r.submissionCount} submission
                        {r.submissionCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
