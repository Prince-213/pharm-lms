import { CourseStatus } from "@/generated/prisma/enums";

/** Course statuses a tutor may delete (when there are no successful purchases). */
export const TUTOR_DELETABLE_STATUSES: CourseStatus[] = [
  CourseStatus.DRAFT,
  CourseStatus.REJECTED,
];

export type TutorDeleteCourseErrorCode =
  | "NOT_FOUND"
  | "LOCKED_STATUS"
  | "HAS_SALES"
  | "CONFIRM_MISMATCH";

export type TutorDeleteCourseResult =
  | { ok: true; title: string }
  | { ok: false; error: TutorDeleteCourseErrorCode };

export function canTutorDeleteCourse(
  status: CourseStatus,
  hasSuccessfulPurchases: boolean,
): boolean {
  return (
    TUTOR_DELETABLE_STATUSES.includes(status) && !hasSuccessfulPurchases
  );
}
