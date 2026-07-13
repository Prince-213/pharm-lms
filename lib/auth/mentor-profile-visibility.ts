import { MentorProfileStatus } from "@/generated/prisma/enums";

export function mentorVisibleToStudents(
  mentorProfileStatus: MentorProfileStatus,
): boolean {
  return mentorProfileStatus === MentorProfileStatus.APPROVED;
}
