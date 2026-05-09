import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

type Db = typeof db;
type TransactionClient = Omit<
  Db,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$extends"
  | "$use"
>;

async function deleteAIQuizAttemptsForIds(
  tx: TransactionClient,
  attemptIds: string[],
) {
  if (attemptIds.length === 0) return;
  const questions = await tx.aIQuestion.findMany({
    where: { attemptId: { in: attemptIds } },
    select: { id: true },
  });
  const qids = questions.map((q) => q.id);
  if (qids.length > 0) {
    await tx.aIAnswerReview.deleteMany({ where: { questionId: { in: qids } } });
  }
  await tx.aIQuestion.deleteMany({ where: { attemptId: { in: attemptIds } } });
  await tx.aIQuizAttempt.deleteMany({ where: { id: { in: attemptIds } } });
}

async function deleteAIQuizAttemptsForStudent(
  tx: TransactionClient,
  studentId: string,
) {
  const attempts = await tx.aIQuizAttempt.findMany({
    where: { studentId },
    select: { id: true },
  });
  await deleteAIQuizAttemptsForIds(
    tx,
    attempts.map((a) => a.id),
  );
}

async function deleteAIQuizAttemptsForCourse(
  tx: TransactionClient,
  courseId: string,
) {
  const attempts = await tx.aIQuizAttempt.findMany({
    where: { courseId },
    select: { id: true },
  });
  await deleteAIQuizAttemptsForIds(
    tx,
    attempts.map((a) => a.id),
  );
}

async function deleteStudentBatchTree(
  tx: TransactionClient,
  batchIds: string[],
) {
  if (batchIds.length === 0) return;
  await tx.batchMembership.deleteMany({ where: { batchId: { in: batchIds } } });
  await tx.assignmentBatch.deleteMany({ where: { batchId: { in: batchIds } } });
  await tx.studentBatch.deleteMany({ where: { id: { in: batchIds } } });
}

async function deleteCourseAndAllContent(
  tx: TransactionClient,
  courseId: string,
) {
  const assignments = await tx.assignment.findMany({
    where: { courseId },
    select: { id: true },
  });
  const assignmentIds = assignments.map((a) => a.id);

  if (assignmentIds.length > 0) {
    await tx.assignmentSubmission.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    });
    await tx.assignmentBatch.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    });
    await tx.notification.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    });
  }

  const batches = await tx.studentBatch.findMany({
    where: { courseId },
    select: { id: true },
  });
  await deleteStudentBatchTree(
    tx,
    batches.map((b) => b.id),
  );

  if (assignmentIds.length > 0) {
    await tx.assignment.deleteMany({ where: { id: { in: assignmentIds } } });
  }

  const threads = await tx.forumThread.findMany({
    where: { courseId },
    select: { id: true },
  });
  const threadIds = threads.map((t) => t.id);
  if (threadIds.length > 0) {
    await tx.forumPost.deleteMany({ where: { threadId: { in: threadIds } } });
    await tx.forumThread.deleteMany({ where: { id: { in: threadIds } } });
  }

  await tx.enrollment.deleteMany({ where: { courseId } });

  const sections = await tx.courseSection.findMany({
    where: { courseId },
    select: { id: true },
  });
  const sectionIds = sections.map((s) => s.id);

  const lessons =
    sectionIds.length > 0
      ? await tx.lesson.findMany({
          where: { sectionId: { in: sectionIds } },
          select: { id: true },
        })
      : [];
  const lessonIds = lessons.map((l) => l.id);

  if (lessonIds.length > 0) {
    await tx.lessonProgress.deleteMany({
      where: { lessonId: { in: lessonIds } },
    });
  }

  const quizzes =
    sectionIds.length > 0
      ? await tx.sectionQuiz.findMany({
          where: { sectionId: { in: sectionIds } },
          select: { id: true },
        })
      : [];
  const quizIds = quizzes.map((q) => q.id);
  if (quizIds.length > 0) {
    await tx.sectionQuizAttempt.deleteMany({
      where: { quizId: { in: quizIds } },
    });
    await tx.sectionQuiz.deleteMany({ where: { id: { in: quizIds } } });
  }

  if (lessonIds.length > 0) {
    await tx.lesson.deleteMany({ where: { id: { in: lessonIds } } });
  }

  if (sectionIds.length > 0) {
    await tx.courseSection.deleteMany({ where: { id: { in: sectionIds } } });
  }

  await deleteAIQuizAttemptsForCourse(tx, courseId);

  await tx.courseApprovalWorkflow.deleteMany({ where: { courseId } });
  await tx.courseVisit.deleteMany({ where: { courseId } });
  await tx.wishlist.deleteMany({ where: { courseId } });
  await tx.courseReview.deleteMany({ where: { courseId } });

  const reqs = await tx.meetingRequest.findMany({
    where: { courseId },
    select: { id: true },
  });
  const reqIds = reqs.map((r) => r.id);
  if (reqIds.length > 0) {
    await tx.meeting.deleteMany({
      where: { meetingRequestId: { in: reqIds } },
    });
    await tx.meetingRequest.deleteMany({ where: { id: { in: reqIds } } });
  }

  await tx.course.delete({ where: { id: courseId } });
}

async function deleteSharedUserEdges(
  tx: TransactionClient,
  userId: string,
  adminId: string,
  email: string,
) {
  await tx.chatMessage.deleteMany({ where: { senderId: userId } });
  await tx.chatThreadParticipant.deleteMany({ where: { userId } });

  const orphanThreads = await tx.chatThread.findMany({
    where: { participants: { none: {} } },
    select: { id: true },
  });
  for (const { id } of orphanThreads) {
    await tx.chatMessage.deleteMany({ where: { threadId: id } });
    await tx.chatThread.delete({ where: { id } });
  }

  await tx.auditLog.deleteMany({ where: { actorId: userId } });
  await tx.badge.updateMany({
    where: { createdById: userId },
    data: { createdById: adminId },
  });
  await tx.signupOtp.deleteMany({ where: { email } });
  await tx.verificationToken.deleteMany({ where: { identifier: email } });
}

async function deleteOrphanAssignmentsByCreator(
  tx: TransactionClient,
  createdById: string,
) {
  const remaining = await tx.assignment.findMany({
    where: { createdById },
    select: { id: true },
  });
  const ids = remaining.map((a) => a.id);
  if (ids.length === 0) return;
  await tx.assignmentSubmission.deleteMany({
    where: { assignmentId: { in: ids } },
  });
  await tx.assignmentBatch.deleteMany({
    where: { assignmentId: { in: ids } },
  });
  await tx.notification.deleteMany({ where: { assignmentId: { in: ids } } });
  await tx.assignment.deleteMany({ where: { id: { in: ids } } });
}

async function deleteTutorSpecificResiduals(tx: TransactionClient, userId: string) {
  const orphanBatches = await tx.studentBatch.findMany({
    where: { mentorId: userId },
    select: { id: true },
  });
  await deleteStudentBatchTree(
    tx,
    orphanBatches.map((b) => b.id),
  );

  await tx.meeting.deleteMany({ where: { OR: [{ mentorId: userId }, { studentId: userId }] } });
  await tx.meetingRequest.deleteMany({
    where: { OR: [{ mentorId: userId }, { studentId: userId }] },
  });

  await tx.mentorAvailability.deleteMany({ where: { mentorId: userId } });
  await deleteOrphanAssignmentsByCreator(tx, userId);
  await tx.forumPost.deleteMany({ where: { authorId: userId } });
}

async function deleteMentorResiduals(tx: TransactionClient, userId: string) {
  const batches = await tx.studentBatch.findMany({
    where: { mentorId: userId },
    select: { id: true },
  });
  await deleteStudentBatchTree(
    tx,
    batches.map((b) => b.id),
  );

  await tx.meeting.deleteMany({ where: { OR: [{ mentorId: userId }, { studentId: userId }] } });
  await tx.meetingRequest.deleteMany({
    where: { OR: [{ mentorId: userId }, { studentId: userId }] },
  });

  await tx.mentorAvailability.deleteMany({ where: { mentorId: userId } });
  await deleteOrphanAssignmentsByCreator(tx, userId);
  await tx.forumPost.deleteMany({ where: { authorId: userId } });
}

async function deleteStudentResiduals(tx: TransactionClient, userId: string) {
  await tx.assignmentSubmission.deleteMany({ where: { studentId: userId } });
  await tx.enrollment.deleteMany({ where: { studentId: userId } });
  await tx.lessonProgress.deleteMany({ where: { studentId: userId } });
  await tx.wishlist.deleteMany({ where: { studentId: userId } });
  await tx.sectionQuizAttempt.deleteMany({ where: { studentId: userId } });
  await tx.studentBadge.deleteMany({ where: { studentId: userId } });
  await tx.courseVisit.deleteMany({ where: { studentId: userId } });
  await deleteAIQuizAttemptsForStudent(tx, userId);

  await tx.meeting.deleteMany({ where: { OR: [{ mentorId: userId }, { studentId: userId }] } });
  await tx.meetingRequest.deleteMany({
    where: { OR: [{ mentorId: userId }, { studentId: userId }] },
  });

  await tx.batchMembership.deleteMany({ where: { studentId: userId } });
  await tx.forumPost.deleteMany({ where: { authorId: userId } });
}

/**
 * Hard-deletes a non-admin user and application-owned rows that FK to them.
 * Run inside a transaction with a generous timeout for tutors with large catalogs.
 */
export async function deleteUserAndRelatedDataAsAdmin(params: {
  targetUserId: string;
  expectedRole: "STUDENT" | "TUTOR" | "MENTOR";
  adminUserId: string;
  targetEmail: string;
}) {
  const { targetUserId, expectedRole, adminUserId, targetEmail } = params;

  const roleEnum =
    expectedRole === "STUDENT"
      ? UserRole.STUDENT
      : expectedRole === "TUTOR"
        ? UserRole.TUTOR
        : UserRole.MENTOR;

  await db.$transaction(
    async (tx) => {
      await deleteSharedUserEdges(tx, targetUserId, adminUserId, targetEmail);

      if (expectedRole === "TUTOR") {
        const courses = await tx.course.findMany({
          where: { mentorId: targetUserId },
          select: { id: true },
        });
        for (const { id } of courses) {
          await deleteCourseAndAllContent(tx, id);
        }
        await deleteTutorSpecificResiduals(tx, targetUserId);
      } else if (expectedRole === "MENTOR") {
        await deleteMentorResiduals(tx, targetUserId);
      } else {
        await deleteStudentResiduals(tx, targetUserId);
      }

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: "DELETE_USER",
          entityType: "User",
          entityId: targetUserId,
          payload: { role: roleEnum },
        },
      });

      await tx.user.delete({ where: { id: targetUserId } });
    },
    { maxWait: 15_000, timeout: 120_000 },
  );
}
