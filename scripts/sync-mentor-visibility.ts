/**
 * One-shot repair: mentors visible to students must be isActive + APPROVED.
 * - Approved-but-inactive → activate
 * - Active-but-not-approved → approve
 *
 * Usage: pnpm dlx tsx scripts/sync-mentor-visibility.ts
 */
import { MentorProfileStatus, UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

async function main() {
  const activated = await prisma.user.updateMany({
    where: {
      role: UserRole.MENTOR,
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      isActive: false,
    },
    data: { isActive: true },
  });

  const approved = await prisma.user.updateMany({
    where: {
      role: UserRole.MENTOR,
      isActive: true,
      mentorProfileStatus: { not: MentorProfileStatus.APPROVED },
    },
    data: {
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      mentorReviewedAt: new Date(),
    },
  });

  const visible = await prisma.user.count({
    where: {
      role: UserRole.MENTOR,
      isActive: true,
      mentorProfileStatus: MentorProfileStatus.APPROVED,
    },
  });

  console.log(
    `[sync-mentor-visibility] activated=${activated.count} approved=${approved.count} nowVisibleToStudents=${visible}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
