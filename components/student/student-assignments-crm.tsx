"use client";

import { clsx } from "clsx";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { AssignmentSubmitForm } from "@/components/student/assignment-submit-form";
import { AssignmentStatus, SubmissionStatus } from "@/generated/prisma/enums";

export type StudentAssignmentCrmRow = {
  id: string;
  title: string;
  description: string;
  status: AssignmentStatus;
  dueDateIso: string | null;
  instructionsFileUrl: string | null;
  instructionsLinkUrl: string | null;
  instructionsLinkLabel: string | null;
  course: { id: string; title: string; mentorName: string };
  submission: null | {
    content: string | null;
    attachmentUrl: string | null;
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    submittedAtIso: string | null;
  };
  handoutHref: string | null;
  submissionFileHref: string | null;
};

function isGraded(row: StudentAssignmentCrmRow): boolean {
  const s = row.submission;
  if (!s) return false;
  return (
    (s.grade !== null && s.grade !== undefined) ||
    s.status === SubmissionStatus.GRADED
  );
}

function submissionSummary(row: StudentAssignmentCrmRow): string {
  if (!row.submission) return "Not submitted";
  if (isGraded(row)) {
    const g = row.submission.grade;
    return g != null ? `Graded · ${g}/100` : "Graded";
  }
  return "Submitted";
}

export function StudentAssignmentsCrm({ rows }: { rows: StudentAssignmentCrmRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "SENT" | "CLOSED">("all");
  const [courseId, setCourseId] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const courseOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) {
      m.set(r.course.id, r.course.title);
    }
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const kpis = useMemo(() => {
    const now = Date.now();
    let open = 0;
    let awaitingGrade = 0;
    let graded = 0;
    let closed = 0;
    let overdue = 0;

    for (const r of rows) {
      if (r.status === AssignmentStatus.CLOSED) {
        closed++;
        continue;
      }
      if (r.status !== AssignmentStatus.SENT) continue;

      const g = isGraded(r);
      if (!r.submission) open++;
      else if (!g) awaitingGrade++;
      else graded++;

      if (
        r.dueDateIso &&
        !g &&
        new Date(r.dueDateIso).getTime() < now
      ) {
        overdue++;
      }
    }

    return { open, awaitingGrade, graded, closed, overdue, total: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (courseId !== "all" && r.course.id !== courseId) return false;
      if (!q) return true;
      return (
        `${r.title} ${r.course.title} ${r.course.mentorName}`
          .toLowerCase()
          .includes(q)
      );
    });
  }, [rows, search, statusFilter, courseId]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
        <ClipboardList
          className="h-10 w-10 text-[var(--border)]"
          strokeWidth={1.25}
        />
        <p className="mt-4 text-sm font-semibold">No assignments yet</p>
        <p className="mt-2 max-w-sm text-xs text-[var(--muted)]">
          When your mentor publishes an assignment in a course you&apos;re
          enrolled in, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Total" value={kpis.total} hint="In your list" />
        <Kpi label="To submit" value={kpis.open} hint="Open work" accent="amber" />
        <Kpi
          label="Awaiting grade"
          value={kpis.awaitingGrade}
          hint="Submitted"
          accent="sky"
        />
        <Kpi label="Graded" value={kpis.graded} hint="Has score" accent="emerald" />
        <Kpi label="Closed" value={kpis.closed} hint="Assignment closed" />
        <Kpi label="Overdue" value={kpis.overdue} hint="Past due, not graded" accent="rose" />
      </div>

      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-3">
        <label className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, course, mentor"
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "SENT" | "CLOSED")
          }
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="SENT">Open (sent)</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="all">All courses</option>
          {courseOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Assignment</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[var(--muted)]"
                  >
                    No assignments match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const expanded = expandedId === r.id;
                  const closed = r.status === AssignmentStatus.CLOSED;
                  return (
                    <Fragment key={r.id}>
                      <tr className="align-top hover:bg-[var(--background)]/60">
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((id) => (id === r.id ? null : r.id))
                            }
                            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                            aria-expanded={expanded}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/student/course/${r.course.id}`}
                            className="font-semibold text-[var(--primary)] hover:underline"
                          >
                            {r.course.title}
                          </Link>
                          <p className="text-[11px] text-[var(--muted)]">
                            {r.course.mentorName}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-[var(--foreground)]">
                            {r.title}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted)]">
                          {r.dueDateIso
                            ? new Date(r.dueDateIso).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={clsx(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                              closed
                                ? "bg-slate-100 text-slate-700 ring-slate-200"
                                : "bg-emerald-50 text-emerald-900 ring-emerald-200",
                            )}
                          >
                            {closed ? "closed" : "sent"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <span
                            className={clsx(
                              "font-semibold",
                              !r.submission
                                ? "text-[var(--muted)]"
                                : isGraded(r)
                                  ? "text-emerald-800"
                                  : "text-sky-800",
                            )}
                          >
                            {submissionSummary(r)}
                          </span>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="bg-[var(--background)]/80">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="mx-auto max-w-3xl space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                              {(r.instructionsFileUrl || r.instructionsLinkUrl) && (
                                <div className="flex flex-wrap gap-2 rounded border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-2 text-xs">
                                  <span className="font-bold uppercase tracking-wide text-[var(--muted)]">
                                    Materials
                                  </span>
                                  {r.handoutHref ? (
                                    <a
                                      href={r.handoutHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                                    >
                                      <FileText className="h-3.5 w-3.5" />
                                      Download handout
                                    </a>
                                  ) : null}
                                  {r.instructionsLinkUrl ? (
                                    <a
                                      href={r.instructionsLinkUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      {r.instructionsLinkLabel ?? "Open link"}
                                    </a>
                                  ) : null}
                                </div>
                              )}
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                                {r.description}
                              </p>
                              {r.submission?.feedback ? (
                                <div className="rounded border border-[var(--primary)]/30 bg-[var(--primary-soft)]/40 p-3 text-sm">
                                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                                    Mentor feedback
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                                    {r.submission.feedback}
                                  </p>
                                </div>
                              ) : null}
                              {r.submissionFileHref ? (
                                <a
                                  href={r.submissionFileHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                                >
                                  Your submitted file
                                </a>
                              ) : null}
                              <div className="border-t border-[var(--border)] pt-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                  {r.submission
                                    ? "Update your submission"
                                    : "Your submission"}
                                </p>
                                <AssignmentSubmitForm
                                  assignmentId={r.id}
                                  initialContent={r.submission?.content ?? ""}
                                  initialAttachmentUrl={
                                    r.submission?.attachmentUrl ?? null
                                  }
                                  closed={closed}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
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
  hint: string;
  accent?: "amber" | "sky" | "emerald" | "rose";
}) {
  const ring =
    accent === "amber"
      ? "ring-amber-200/80 bg-amber-50/50"
      : accent === "sky"
        ? "ring-sky-200/80 bg-sky-50/50"
        : accent === "emerald"
          ? "ring-emerald-200/80 bg-emerald-50/50"
          : accent === "rose"
            ? "ring-rose-200/80 bg-rose-50/50"
            : "ring-[var(--border)] bg-[var(--background)]";

  return (
    <div
      className={clsx(
        "rounded-xl border border-[var(--border)] p-4 shadow-sm ring-1",
        ring,
      )}
    >
      <p className="text-2xl font-black tabular-nums text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-[var(--foreground)]">
        {label}
      </p>
      <p className="mt-0.5 text-[10px] text-[var(--muted)]">{hint}</p>
    </div>
  );
}
