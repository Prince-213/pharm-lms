"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export async function deleteDraftCourseAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();

  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    redirect("/tutor/login");
  }

  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: {
      id: true,
      title: true,
      status: true,
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

  if (!course) {
    redirect("/tutor/courses?error=course-not-found");
  }

  if (course.status !== CourseStatus.DRAFT) {
    redirect(`/tutor/courses/${course.id}/manage/settings?error=only-draft`);
  }

  if (confirmText !== course.title) {
    redirect(`/tutor/courses/${course.id}/manage/settings?error=confirm-title`);
  }

  const sectionIds = course.sections.map((s) => s.id);
  const lessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const assignmentIds = course.assignments.map((a) => a.id);
  const forumThreadIds = course.forums.map((f) => f.id);
  const meetingRequestIds = course.meetingRequests.map((m) => m.id);

  await db.$transaction(async (tx) => {
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

      await tx.aIQuestion.deleteMany({
        where: { attemptId: { in: aiAttemptIds } },
      });
      await tx.aIQuizAttempt.deleteMany({
        where: { id: { in: aiAttemptIds } },
      });
    }

    if (assignmentIds.length) {
      await tx.assignmentSubmission.deleteMany({
        where: { assignmentId: { in: assignmentIds } },
      });
      await tx.assignmentBatch.deleteMany({
        where: { assignmentId: { in: assignmentIds } },
      });
    }

    if (batchIds.length) {
      await tx.batchMembership.deleteMany({
        where: { batchId: { in: batchIds } },
      });
      await tx.assignmentBatch.deleteMany({
        where: { batchId: { in: batchIds } },
      });
      await tx.studentBatch.deleteMany({ where: { id: { in: batchIds } } });
    }

    if (forumThreadIds.length) {
      await tx.forumPost.deleteMany({
        where: { threadId: { in: forumThreadIds } },
      });
      await tx.forumThread.deleteMany({
        where: { id: { in: forumThreadIds } },
      });
    }

    if (meetingRequestIds.length) {
      await tx.meeting.deleteMany({
        where: { meetingRequestId: { in: meetingRequestIds } },
      });
      await tx.meetingRequest.deleteMany({
        where: { id: { in: meetingRequestIds } },
      });
    }

    if (lessonIds.length) {
      await tx.lessonProgress.deleteMany({
        where: { lessonId: { in: lessonIds } },
      });
      await tx.lesson.deleteMany({ where: { id: { in: lessonIds } } });
    }

    if (sectionIds.length) {
      await tx.sectionQuiz.deleteMany({
        where: { sectionId: { in: sectionIds } },
      });
      await tx.courseSection.deleteMany({ where: { id: { in: sectionIds } } });
    }

    await tx.enrollment.deleteMany({ where: { courseId } });
    await tx.wishlist.deleteMany({ where: { courseId } });
    await tx.assignment.deleteMany({ where: { courseId } });
    await tx.courseApprovalWorkflow.deleteMany({ where: { courseId } });
    await tx.course.delete({ where: { id: courseId } });
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "MENTOR_DELETE_DRAFT_COURSE",
        entityType: "Course",
        entityId: courseId,
        payload: { title: course.title },
      },
    });
  });

  revalidatePath("/tutor/courses");
  revalidatePath("/tutor/performance");
  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/student/browse");

  redirect("/tutor/courses?deleted=draft");
}
