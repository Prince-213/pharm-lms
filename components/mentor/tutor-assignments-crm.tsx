"use client";

import { clsx } from "clsx";
import {
  ChevronRight,
  ClipboardList,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AssignmentStatus as AssignmentStatusEnum,
  type AssignmentStatus,
} from "@/generated/prisma/enums";

export type TutorAssignmentCrmRow = {
  id: string;
  title: string;
  description: string;
  status: AssignmentStatus;
  dueDateIso: string | null;
  createdAtIso: string;
  course: { id: string; title: string };
  submissionCount: number;
};

const STATUS_TONE: Record<AssignmentStatus, string> = {
  [AssignmentStatusEnum.DRAFT]:
    "bg-amber-50 text-amber-900 ring-amber-200",
  [AssignmentStatusEnum.SENT]:
    "bg-emerald-50 text-emerald-900 ring-emerald-200",
  [AssignmentStatusEnum.CLOSED]:
    "bg-[var(--surface-muted)] text-[var(--foreground)] ring-[var(--border)]",
};

export function TutorAssignmentsCrm({
  rows,
  courses,
}: {
  rows: TutorAssignmentCrmRow[];
  courses: { id: string; title: string }[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AssignmentStatus
  >("all");
  const [courseId, setCourseId] = useState<string>("all");

  const kpis = useMemo(() => {
    let draft = 0;
    let sent = 0;
    let closed = 0;
    let submissions = 0;
    for (const r of rows) {
      if (r.status === AssignmentStatusEnum.DRAFT) draft++;
      else if (r.status === AssignmentStatusEnum.SENT) sent++;
      else closed++;
      submissions += r.submissionCount;
    }
    return {
      draft,
      sent,
      closed,
      total: rows.length,
      submissions,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (courseId !== "all" && r.course.id !== courseId) return false;
      if (!q) return true;
      return `${r.title} ${r.course.title} ${r.description}`
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search, statusFilter, courseId]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center text-sm text-[var(--muted)]">
        <ClipboardList
          className="h-9 w-9 text-[var(--muted)]"
          strokeWidth={1.25}
        />
        <p className="mt-3 font-semibold text-[var(--foreground)]">
          No assignments yet
        </p>
        <p className="mt-1">
          Use the composer above to create your first assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total assignments" value={kpis.total} />
        <Kpi label="Drafts" value={kpis.draft} accent="amber" />
        <Kpi label="Sent" value={kpis.sent} accent="emerald" />
        <Kpi label="Closed" value={kpis.closed} />
        <Kpi
          label="Submissions"
          value={kpis.submissions}
          hint="All assignments"
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, course, description"
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === "all"
                ? "all"
                : (e.target.value as AssignmentStatus),
            )
          }
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value={AssignmentStatusEnum.DRAFT}>Draft</option>
          <option value={AssignmentStatusEnum.SENT}>Sent</option>
          <option value={AssignmentStatusEnum.CLOSED}>Closed</option>
        </select>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Assignment</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Submissions</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--muted)]"
                  >
                    No assignments match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="align-top transition hover:bg-[var(--background)]/60"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/tutor/assignments/${r.id}`}
                        className="font-bold text-[var(--foreground)] hover:text-[var(--primary)]"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                        {r.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/tutor/courses/${r.course.id}/manage/curriculum`}
                        className="text-sm font-semibold text-[var(--primary)] hover:underline"
                      >
                        {r.course.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                          STATUS_TONE[r.status],
                        )}
                      >
                        {r.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {r.dueDateIso
                        ? new Date(r.dueDateIso).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {new Date(r.createdAtIso).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--foreground)]">
                      <span className="font-bold">{r.submissionCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/tutor/assignments/${r.id}`}
                        className="inline-flex rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                        aria-label="Open assignment"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: "amber" | "emerald";
}) {
  const ring =
    accent === "amber"
      ? "ring-amber-200/80 bg-amber-50/40"
      : accent === "emerald"
        ? "ring-emerald-200/80 bg-emerald-50/40"
        : "ring-[var(--border)] bg-[var(--background)]";

  return (
    <div
      className={clsx(
        "rounded-xl border border-[var(--border)] p-4 shadow-sm ring-1",
        ring,
      )}
    >
      <p className="text-2xl font-black tabular-nums text-[var(--foreground)]">
        {value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-[var(--foreground)]">
        {label}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[10px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
