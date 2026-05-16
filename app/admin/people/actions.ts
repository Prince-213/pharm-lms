"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { deleteCourseGraph } from "@/lib/courses/delete-course-graph";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { notifyMentorAccountActivated } from "@/lib/notifications/mentor-events";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: "Unauthorized" as const };
  }
  return { session };
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
  expectedRole: "STUDENT" | "TUTOR" | "MENTOR",
) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user) return { error: "User not found." as const };
  if (user.role !== expectedRole) {
    return { error: `This action only applies to ${expectedRole.toLowerCase()} accounts.` as const };
  }
  if (user.isActive === isActive) return { success: true as const };

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { isActive },
    }),
    db.auditLog.create({
      data: {
        actorId: admin.session.user.id,
        action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entityType: "User",
        entityId: userId,
        payload: { role: expectedRole },
      },
    }),
  ]);

  if (expectedRole === "MENTOR") {
    void notifyMentorAccountActivated(userId, isActive);
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/tutors");
  revalidatePath("/admin/mentors");
  revalidatePath("/admin/mentor-applications");
  revalidatePath("/admin/dashboard");

  return { success: true as const };
}

function revalidateAfterUserDelete() {
  revalidatePath("/admin/students");
  revalidatePath("/admin/tutors");
  revalidatePath("/admin/mentors");
  revalidatePath("/admin/mentor-applications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/course-approvals");
  revalidatePath("/mentor/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");
  revalidatePath("/tutor/courses");
}

async function deleteAiAttemptsForStudent(
  tx: Prisma.TransactionClient,
  studentId: string,
) {
  const aiAttemptIds = (
    await tx.aIQuizAttempt.findMany({
      where: { studentId },
      select: { id: true },
    })
  ).map((a) => a.id);
  if (!aiAttemptIds.length) return;
  const aiQuestionIds = (
    await tx.aIQuestion.findMany({
      where: { attemptId: { in: aiAttemptIds } },
      select: { id: true },
    })
  ).map((q) => q.id);
  if (aiQuestionIds.length) {
    await tx.aIAnswerReview.deleteMany({
      where: { questionId: { in: aiQuestionIds } },
    });
  }
  await tx.aIQuestion.deleteMany({ where: { attemptId: { in: aiAttemptIds } } });
  await tx.aIQuizAttempt.deleteMany({ where: { id: { in: aiAttemptIds } } });
}

/**
 * Permanently deletes a non-admin user and application data tied to them.
 * Tutors: all owned courses are removed via the same graph as admin course delete.
 * Requires typing the account email to confirm.
 */
export async function adminDeleteUserAndData(
  userId: string,
  expectedRole: "STUDENT" | "TUTOR" | "MENTOR",
  confirmationEmail: string,
) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  if (userId === admin.session.user.id) {
    return { error: "You cannot delete your own admin account." as const };
  }

  const expectedPrismaRole =
    expectedRole === "STUDENT"
      ? UserRole.STUDENT
      : expectedRole === "TUTOR"
        ? UserRole.TUTOR
        : UserRole.MENTOR;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  if (!user) return { error: "User not found." as const };
  if (user.role === UserRole.ADMIN) {
    return { error: "Admin accounts cannot be deleted this way." as const };
  }
  if (user.role !== expectedPrismaRole) {
    return { error: `This action only applies to ${expectedRole.toLowerCase()} accounts.` as const };
  }

  const normalized = confirmationEmail.trim().toLowerCase();
  if (!normalized || normalized !== user.email.toLowerCase()) {
    return { error: "Confirmation email must match the user exactly." as const };
  }

  const snapshot = { email: user.email, role: user.role };

  // This delete touches many tables; keep it resilient under load.
  await db.$transaction(
    async (tx) => {
    if (user.role === UserRole.TUTOR) {
      const ownedCourseIds = (
        await tx.course.findMany({
          where: { mentorId: userId },
          select: { id: true },
        })
      ).map((c) => c.id);
      for (const cid of ownedCourseIds) {
        const result = await deleteCourseGraph(tx, cid);
        if (!result.ok) {
          throw new Error(`Course ${cid} missing during tutor delete`);
        }
      }
      const orphanBatchIds = (
        await tx.studentBatch.findMany({
          where: { mentorId: userId },
          select: { id: true },
        })
      ).map((b) => b.id);
      if (orphanBatchIds.length) {
        await tx.batchMembership.deleteMany({
          where: { batchId: { in: orphanBatchIds } },
        });
        await tx.assignmentBatch.deleteMany({
          where: { batchId: { in: orphanBatchIds } },
        });
        await tx.studentBatch.deleteMany({ where: { id: { in: orphanBatchIds } } });
      }
    }

    await tx.meeting.deleteMany({
      where: { OR: [{ mentorId: userId }, { studentId: userId }] },
    });
    await tx.meetingRequest.deleteMany({
      where: { OR: [{ mentorId: userId }, { studentId: userId }] },
    });

    await tx.assignmentSubmission.deleteMany({ where: { studentId: userId } });
    await tx.batchMembership.deleteMany({ where: { studentId: userId } });
    await tx.lessonProgress.deleteMany({ where: { studentId: userId } });
    await tx.enrollment.deleteMany({ where: { studentId: userId } });
    await tx.wishlist.deleteMany({ where: { studentId: userId } });
    await tx.courseVisit.deleteMany({ where: { studentId: userId } });
    await tx.courseReview.deleteMany({ where: { studentId: userId } });
    await tx.sectionQuizAttempt.deleteMany({ where: { studentId: userId } });
    await deleteAiAttemptsForStudent(tx, userId);

    await tx.forumPost.deleteMany({ where: { authorId: userId } });
    await tx.studentBadge.deleteMany({ where: { studentId: userId } });

    await tx.mentorAvailability.deleteMany({ where: { mentorId: userId } });

    await tx.badge.updateMany({
      where: { createdById: userId },
      data: { createdById: admin.session.user.id },
    });

    await tx.chatMessage.deleteMany({ where: { senderId: userId } });
    await tx.chatThreadParticipant.deleteMany({ where: { userId } });
    const emptyThreads = await tx.chatThread.findMany({
      where: { participants: { none: {} } },
      select: { id: true },
    });
    const emptyThreadIds = emptyThreads.map((t) => t.id);
    if (emptyThreadIds.length) {
      await tx.chatMessage.deleteMany({
        where: { threadId: { in: emptyThreadIds } },
      });
      await tx.chatThread.deleteMany({ where: { id: { in: emptyThreadIds } } });
    }

    await tx.signupOtp.deleteMany({ where: { email: user.email } });

    await tx.user.delete({ where: { id: userId } });

    await tx.auditLog.create({
      data: {
        actorId: admin.session.user.id,
        action: "DELETE_USER",
        entityType: "User",
        entityId: userId,
        payload: snapshot as object,
      },
    });
    },
    { timeout: 30000 },
  );

  // Clean up historic audit trail after user is removed.
  await db.auditLog.deleteMany({ where: { actorId: userId } });

  revalidateAfterUserDelete();
  return { success: true as const };
}
