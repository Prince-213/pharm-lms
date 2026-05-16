import type { Prisma } from "@/generated/prisma/client";

export type DeleteCourseGraphResult =
  | { ok: false }
  | { ok: true; title: string };

/**
 * Deletes a course and all dependent rows (curriculum, enrollments, forums,
 * meetings, AI quiz data, purchases, etc.). Must run inside a transaction.
 */
export async function deleteCourseGraph(
  tx: Prisma.TransactionClient,
  courseId: string,
): Promise<DeleteCourseGraphResult> {
  const course = await tx.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      sections: {
        select: {
          id: true,
          lessons: { select: { id: true } },
        },
      },
      assignments: { select: { id: true } },
      forums: { select: { id: true } },
      meetingRequests: { select: { id: true } },
    },
  });
  if (!course) return { ok: false };

  const sectionIds = course.sections.map((s) => s.id);
  const lessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const assignmentIds = course.assignments.map((a) => a.id);
  const forumThreadIds = course.forums.map((f) => f.id);
  const meetingRequestIds = course.meetingRequests.map((m) => m.id);

  const aiAttemptIds = (
    await tx.aIQuizAttempt.findMany({
      where: { courseId },
      select: { id: true },
    })
  ).map((a) => a.id);

  const batchIds = (
    await tx.studentBatch.findMany({
      where: { courseId },
      select: { id: true },
    })
  ).map((b) => b.id);

  if (aiAttemptIds.length) {
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

  if (assignmentIds.length) {
    await tx.notification.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    });
    await tx.assignmentSubmission.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    });
    await tx.assignmentBatch.deleteMany({
      where: { assignmentId: { in: assignmentIds } },
    });
  }

  if (batchIds.length) {
    await tx.batchMembership.deleteMany({ where: { batchId: { in: batchIds } } });
    await tx.assignmentBatch.deleteMany({ where: { batchId: { in: batchIds } } });
    await tx.studentBatch.deleteMany({ where: { id: { in: batchIds } } });
  }

  if (forumThreadIds.length) {
    await tx.forumPost.deleteMany({ where: { threadId: { in: forumThreadIds } } });
    await tx.forumThread.deleteMany({ where: { id: { in: forumThreadIds } } });
  }

  if (meetingRequestIds.length) {
    await tx.meeting.deleteMany({ where: { meetingRequestId: { in: meetingRequestIds } } });
    await tx.meetingRequest.deleteMany({ where: { id: { in: meetingRequestIds } } });
  }

  if (lessonIds.length) {
    await tx.studentLessonNote.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await tx.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
    await tx.lesson.deleteMany({ where: { id: { in: lessonIds } } });
  }

  if (sectionIds.length) {
    const quizIds = (
      await tx.sectionQuiz.findMany({
        where: { sectionId: { in: sectionIds } },
        select: { id: true },
      })
    ).map((q) => q.id);
    if (quizIds.length) {
      await tx.sectionQuizAttempt.deleteMany({ where: { quizId: { in: quizIds } } });
    }
    await tx.sectionQuiz.deleteMany({ where: { sectionId: { in: sectionIds } } });
    await tx.courseSection.deleteMany({ where: { id: { in: sectionIds } } });
  }

  await tx.coursePurchase.deleteMany({ where: { courseId } });
  await tx.courseReview.deleteMany({ where: { courseId } });
  await tx.enrollment.deleteMany({ where: { courseId } });
  await tx.wishlist.deleteMany({ where: { courseId } });
  await tx.courseVisit.deleteMany({ where: { courseId } });
  await tx.assignment.deleteMany({ where: { courseId } });
  await tx.courseApprovalWorkflow.deleteMany({ where: { courseId } });
  await tx.course.delete({ where: { id: courseId } });

  return { ok: true, title: course.title };
}
