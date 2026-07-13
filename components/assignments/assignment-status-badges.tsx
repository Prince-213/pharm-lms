import { clsx } from "clsx";
import { AssignmentStatus, SubmissionStatus } from "@/generated/prisma/enums";

const assignmentPill: Record<AssignmentStatus, string> = {
  [AssignmentStatus.DRAFT]:
    "bg-amber-100 text-amber-950 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800",
  [AssignmentStatus.SENT]:
    "bg-primary/15 text-primary ring-primary/20 dark:bg-primary/20 dark:text-primary-foreground/90 dark:ring-primary/30",
  [AssignmentStatus.CLOSED]:
    "bg-[var(--surface-muted)] text-muted-foreground ring-[var(--border)]",
};

const submissionPill: Record<SubmissionStatus, string> = {
  [SubmissionStatus.SUBMITTED]:
    "bg-sky-100 text-sky-950 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-100 dark:ring-sky-800",
  [SubmissionStatus.GRADED]:
    "bg-violet-100 text-violet-950 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-800",
  [SubmissionStatus.LATE]:
    "bg-orange-100 text-orange-950 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-100 dark:ring-orange-800",
};

export function AssignmentStatusPill({ status }: { status: AssignmentStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
        assignmentPill[status],
      )}
    >
      {status === AssignmentStatus.SENT ? "Open" : status.toLowerCase()}
    </span>
  );
}

export function SubmissionStatusPill({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
        submissionPill[status],
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

/** Student-facing label for their row (combines assignment + submission). */
export function StudentAssignmentRowStatus({
  assignmentClosed,
  submission,
}: {
  assignmentClosed: boolean;
  submission: { status: SubmissionStatus; grade: number | null } | null;
}) {
  if (assignmentClosed) {
    return (
      <span className="inline-flex rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground ring-1 ring-[var(--border)]">
        Closed
      </span>
    );
  }
  if (!submission) {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800">
        To do
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <SubmissionStatusPill status={submission.status} />
      {submission.grade !== null && submission.grade !== undefined ? (
        <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">
          {submission.grade}/100
        </span>
      ) : null}
    </span>
  );
}
