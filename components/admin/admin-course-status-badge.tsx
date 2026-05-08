import { clsx } from "clsx";
import { CourseStatus } from "@/generated/prisma/enums";

const labels: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "Draft",
  [CourseStatus.SUBMITTED]: "Pending review",
  [CourseStatus.APPROVED]: "Approved",
  [CourseStatus.REJECTED]: "Rejected",
  [CourseStatus.PUBLISHED]: "Published",
};

const styles: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "bg-zinc-100 text-zinc-800 ring-zinc-200",
  [CourseStatus.SUBMITTED]: "bg-amber-50 text-amber-950 ring-amber-200",
  [CourseStatus.APPROVED]: "bg-sky-50 text-sky-950 ring-sky-200",
  [CourseStatus.REJECTED]: "bg-rose-50 text-rose-950 ring-rose-200",
  [CourseStatus.PUBLISHED]: "bg-emerald-50 text-emerald-950 ring-emerald-200",
};

export function AdminCourseStatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
