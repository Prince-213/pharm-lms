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
import { StudentAssignmentRowStatus } from "@/components/assignments/assignment-status-badges";
import { AssignmentInstructionsBody } from "@/components/assignments/assignment-instructions-body";
import { AssignmentSubmitForm } from "@/components/student/assignment-submit-form";
import {
  type AssignmentStatus,
  SubmissionStatus,
} from "@/generated/prisma/enums";

export type StudentAssignmentRow = {
  assignmentId: string;
  title: string;
  courseId: string;
  courseTitle: string;
  mentorName: string;
  assignmentStatus: AssignmentStatus;
  closed: boolean;
  instructions: string;
  sectionTitle: string | null;
  hasHandout: boolean;
  handoutHref: string | null;
  instructionsLinkUrl: string | null;
  instructionsLinkLabel: string | null;
  submission: null | {
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    content: string | null;
    attachmentUrl: string | null;
    submissionFileHref: string | null;
  };
};

type FilterId = "all" | "open" | "submitted" | "graded" | "closed";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "To do" },
  { id: "submitted", label: "Submitted" },
  { id: "graded", label: "Graded" },
  { id: "closed", label: "Closed" },
];

function rowMatchesFilter(row: StudentAssignmentRow, f: FilterId): boolean {
  if (f === "all") return true;
  const sub = row.submission;
  if (f === "closed") return row.closed;
  if (f === "graded") return Boolean(sub?.status === SubmissionStatus.GRADED);
  if (f === "submitted") {
    return Boolean(
      sub &&
        sub.status !== SubmissionStatus.GRADED &&
        (sub.status === SubmissionStatus.SUBMITTED ||
          sub.status === SubmissionStatus.LATE),
    );
  }
  if (f === "open") {
    return !row.closed && !sub;
  }
  return true;
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center shadow-[var(--shadow-sm)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

export function StudentAssignmentsWorkspace({
  rows,
}: {
  rows: StudentAssignmentRow[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    let open = 0;
    let submitted = 0;
    let graded = 0;
    let closed = 0;
    for (const r of rows) {
      if (r.closed) closed += 1;
      else if (!r.submission) open += 1;
      else if (r.submission.status === SubmissionStatus.GRADED) graded += 1;
      else submitted += 1;
    }
    return { total: rows.length, open, submitted, graded, closed };
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!rowMatchesFilter(r, filter)) return false;
      if (!term) return true;
      const hay = `${r.title} ${r.courseTitle} ${r.mentorName}`.toLowerCase();
      return hay.includes(term);
    });
  }, [rows, filter, search]);

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Work from your enrolled courses. Search, filter, then expand a row for
          instructions and submission.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <ClipboardList
            className="h-10 w-10 text-[var(--border)]"
            strokeWidth={1.25}
          />
          <p className="mt-4 text-sm font-semibold">No assignments yet</p>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground">
            When your tutor publishes an assignment in a course you&apos;re
            enrolled in, it will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <StatTile label="Total" value={stats.total} />
            <StatTile label="To do" value={stats.open} />
            <StatTile label="Submitted" value={stats.submitted} />
            <StatTile label="Graded" value={stats.graded} />
            <StatTile label="Closed" value={stats.closed} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="relative min-w-[200px] flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, course, or tutor…"
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
                      : "bg-[var(--surface-muted)] text-muted-foreground hover:text-[var(--foreground)]",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-8 px-3 py-3" />
                  <th className="px-3 py-3">Assignment</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">Your status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No assignments match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const open = expandedId === r.assignmentId;
                    return (
                      <Fragment key={r.assignmentId}>
                        <tr
                          className={clsx(
                            "cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/60",
                            open && "bg-[var(--primary-soft)]/30",
                          )}
                          onClick={() => toggleExpand(r.assignmentId)}
                        >
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(r.assignmentId);
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-[var(--surface-muted)]"
                              aria-expanded={open}
                            >
                              {open ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-3 font-semibold text-[var(--foreground)]">
                            {r.title}
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              href={`/student/course/${r.courseId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-[var(--primary)] hover:underline"
                            >
                              {r.courseTitle}
                            </Link>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {r.mentorName}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <StudentAssignmentRowStatus
                              assignmentClosed={r.closed}
                              submission={r.submission}
                            />
                          </td>
                        </tr>
                        {open ? (
                          <tr className="bg-[var(--background)]">
                            <td
                              colSpan={4}
                              className="border-t border-[var(--border)] px-4 py-4"
                            >
                              <AssignmentDetailPanel row={r} />
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

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.length === 0 ? (
              <li className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-muted-foreground">
                No assignments match your filters.
              </li>
            ) : (
              filtered.map((r) => {
                const open = expandedId === r.assignmentId;
                return (
                  <li
                    key={r.assignmentId}
                    className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(r.assignmentId)}
                      className="flex w-full items-start gap-2 px-4 py-3 text-left"
                    >
                      {open ? (
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--foreground)]">
                          {r.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <Link
                            href={`/student/course/${r.courseId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-[var(--primary)]"
                          >
                            {r.courseTitle}
                          </Link>
                          {" · "}
                          {r.mentorName}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StudentAssignmentRowStatus
                            assignmentClosed={r.closed}
                            submission={r.submission}
                          />
                        </div>
                      </div>
                    </button>
                    {open ? (
                      <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-4">
                        <AssignmentDetailPanel row={r} />
                      </div>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </div>
  );
}

function AssignmentDetailPanel({ row }: { row: StudentAssignmentRow }) {
  return (
    <div className="space-y-4">
      {(row.hasHandout && row.handoutHref) || row.instructionsLinkUrl ? (
        <div className="flex flex-wrap gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs">
          <span className="font-bold uppercase tracking-wide text-muted-foreground">
            Materials
          </span>
          {row.handoutHref ? (
            <a
              href={row.handoutHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
            >
              <FileText className="h-3.5 w-3.5" />
              Download handout
            </a>
          ) : null}
          {row.instructionsLinkUrl ? (
            <a
              href={row.instructionsLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {row.instructionsLinkLabel ?? "Open link"}
            </a>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Instructions
        </p>
        {row.sectionTitle ? (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Section: {row.sectionTitle}
          </p>
        ) : null}
        <div className="mt-2">
          <AssignmentInstructionsBody instructions={row.instructions} />
        </div>
      </div>

      {row.submission?.feedback ? (
        <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary-soft)]/40 p-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
            Tutor feedback
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">
            {row.submission.feedback}
          </p>
        </div>
      ) : null}

      {row.submission?.submissionFileHref ? (
        <div>
          <a
            href={row.submission.submissionFileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Your submitted file
          </a>
        </div>
      ) : null}

      <div className="border-t border-[var(--border)] pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {row.submission ? "Update your submission" : "Your submission"}
        </p>
        <AssignmentSubmitForm
          assignmentId={row.assignmentId}
          initialContent={row.submission?.content ?? ""}
          initialAttachmentUrl={row.submission?.attachmentUrl ?? null}
          closed={row.closed}
        />
      </div>
    </div>
  );
}
