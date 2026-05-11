import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";

async function main() {
  const mentors = await prisma.user.findMany({
    where: { role: UserRole.MENTOR },
    select: { id: true, email: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`[clear-mentors] found mentors=${mentors.length}`);

  if (mentors.length === 0) return;

  for (const m of mentors) {
    const userId = m.id;
    console.log(`[clear-mentors] deleting mentor id=${userId} email=${m.email}`);

    await prisma.$transaction(
      async (tx) => {
        await tx.meeting.deleteMany({ where: { OR: [{ mentorId: userId }, { studentId: userId }] } });
        await tx.meetingRequest.deleteMany({ where: { OR: [{ mentorId: userId }, { studentId: userId }] } });

        await tx.assignmentSubmission.deleteMany({ where: { studentId: userId } });
        await tx.batchMembership.deleteMany({ where: { studentId: userId } });
        await tx.lessonProgress.deleteMany({ where: { studentId: userId } });
        await tx.enrollment.deleteMany({ where: { studentId: userId } });
        await tx.wishlist.deleteMany({ where: { studentId: userId } });
        await tx.courseVisit.deleteMany({ where: { studentId: userId } });
        await tx.courseReview.deleteMany({ where: { studentId: userId } });
        await tx.sectionQuizAttempt.deleteMany({ where: { studentId: userId } });

        await tx.forumPost.deleteMany({ where: { authorId: userId } });
        await tx.studentBadge.deleteMany({ where: { studentId: userId } });
        await tx.mentorAvailability.deleteMany({ where: { mentorId: userId } });

        await tx.chatMessage.deleteMany({ where: { senderId: userId } });
        await tx.chatThreadParticipant.deleteMany({ where: { userId } });

        await tx.notification.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });

        await tx.user.delete({ where: { id: userId } });
      },
      { timeout: 60000 },
    );

    // audit log cleanup after transaction
    await prisma.auditLog.deleteMany({ where: { actorId: userId } });
  }

  console.log("[clear-mentors] done");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[clear-mentors] failed", e);
    process.exit(1);
  });

