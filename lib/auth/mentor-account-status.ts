import { MentorProfileStatus } from "@/generated/prisma/enums";

export type MentorAccountDisplayStatus =
  | "incomplete"
  | "pending_activation"
  | "active"
  | "rejected"
  | "inactive";

export function resolveMentorAccountDisplayStatus(input: {
  isActive: boolean;
  mentorProfileStatus: MentorProfileStatus;
}): MentorAccountDisplayStatus {
  if (!input.isActive) return "inactive";

  switch (input.mentorProfileStatus) {
    case MentorProfileStatus.PENDING_REVIEW:
      return "pending_activation";
    case MentorProfileStatus.APPROVED:
      return "active";
    case MentorProfileStatus.REJECTED:
      return "rejected";
    case MentorProfileStatus.INCOMPLETE:
    default:
      return "incomplete";
  }
}

export function mentorAccountDisplayLabel(
  status: MentorAccountDisplayStatus,
): string {
  switch (status) {
    case "pending_activation":
      return "Pending activation";
    case "incomplete":
      return "Setup incomplete";
    case "active":
      return "Active";
    case "rejected":
      return "Rejected";
    case "inactive":
      return "Inactive";
  }
}

export function mentorNeedsAdminActivation(
  status: MentorAccountDisplayStatus,
): boolean {
  return status === "pending_activation";
}
