"use client";

import { clsx } from "clsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { SubmissionStatusPill } from "@/components/assignments/assignment-status-badges";
import { GradeSubmissionForm } from "@/components/mentor/grade-submission-form";
import type { SubmissionStatus } from "@/generated/prisma/enums";

export type TutorSubmissionRow = {
  submissionId: string;
  studentName: string;
  email: string;
  submittedAtIso: string | null;
  status: SubmissionStatus;
  grade: number | null;
  content: string | null;
  fileHref: string | null;
  initialFeedback: string;
};

export function TutorAssignmentSubmissionsPanel({
  rows,
}: {
  rows: TutorSubmissionRow[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-muted-foreground">
        No submissions yet.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-8 px-3 py-3" />
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Submitted</th>
              <th className="px-3 py-3">Status / grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((r) => {
              const open = expandedId === r.submissionId;
              return (
                <Fragment key={r.submissionId}>
                  <tr
                    className={clsx(
                      "cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/60",
                      open && "bg-[var(--primary-soft)]/30",
                    )}
                    onClick={() => toggle(r.submissionId)}
                  >
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(r.submissionId);
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
                      {r.studentName}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {r.email}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                      {r.submittedAtIso
                        ? new Date(r.submittedAtIso).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex flex-wrap items-center gap-1.5">
                        <SubmissionStatusPill status={r.status} />
                        {r.grade !== null && r.grade !== undefined ? (
                          <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">
                            {r.grade}/100
                          </span>
                        ) : null}
                      </span>
                    </td>
                  </tr>
                  {open ? (
                    <tr className="bg-[var(--background)]">
                      <td
                        colSpan={5}
                        className="border-t border-[var(--border)] px-4 py-4"
                      >
                        <SubmissionDetailBody row={r} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((r) => {
          const open = expandedId === r.submissionId;
          return (
            <li
              key={r.submissionId}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            >
              <button
                type="button"
                onClick={() => toggle(r.submissionId)}
                className="flex w-full items-start gap-2 px-4 py-3 text-left"
              >
                {open ? (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--foreground)]">
                    {r.studentName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SubmissionStatusPill status={r.status} />
                    {r.grade !== null && r.grade !== undefined ? (
                      <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">
                        {r.grade}/100
                      </span>
                    ) : null}
                    {r.submittedAtIso ? (
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.submittedAtIso).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
              {open ? (
                <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-4">
                  <SubmissionDetailBody row={r} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function SubmissionDetailBody({ row }: { row: TutorSubmissionRow }) {
  return (
    <div className="space-y-4">
      {row.fileHref ? (
        <p>
          <a
            href={row.fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Download submitted file
          </a>
        </p>
      ) : null}
      {row.content ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Submission text
          </p>
          <div className="mt-1 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm leading-relaxed text-[var(--foreground)]">
            {row.content}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No written response.</p>
      )}
      <div className="border-t border-[var(--border)] pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Grade & feedback
        </p>
        <GradeSubmissionForm
          submissionId={row.submissionId}
          initialGrade={row.grade ?? undefined}
          initialFeedback={row.initialFeedback}
        />
      </div>
    </div>
  );
}
