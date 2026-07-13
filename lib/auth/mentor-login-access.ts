import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

/**
 * Mentors can always use their dashboard. `mentorProfileStatus` controls student
 * directory visibility — not `isActive`.
 *
 * Legacy signups incorrectly set `isActive: false` on create; repair those on
 * login while preserving admin deactivations (APPROVED + inactive).
 */
export async function ensureMentorCanSignIn(user: {
  id: string;
  role: UserRole;
  isActive: boolean;
  mentorProfileStatus: MentorProfileStatus;
}): Promise<{ isActive: boolean }> {
  if (user.role !== UserRole.MENTOR || user.isActive) {
    return { isActive: user.isActive };
  }

  if (user.mentorProfileStatus === MentorProfileStatus.APPROVED) {
    return { isActive: false };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true },
    select: { id: true },
  });
  return { isActive: true };
}
