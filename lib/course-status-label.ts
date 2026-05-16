import { CourseStatus } from "@/generated/prisma/enums";

/** Human-readable course status (safe for client components). */
export function courseStatusLabel(status: CourseStatus): string {
  switch (status) {
    case CourseStatus.DRAFT:
      return "DRAFT";
    case CourseStatus.SUBMITTED:
      return "Pending review";
    case CourseStatus.APPROVED:
      return "Approved";
    case CourseStatus.REJECTED:
      return "Rejected";
    case CourseStatus.PUBLISHED:
      return "Published";
    default:
      return status;
  }
}
