"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email-service";
import { getApprovalTemplate, getRejectionTemplate } from "@/lib/notifications/email-templates";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: "Unauthorized" as const };
  }
  return { session };
}

export async function approveCourseAction(courseId: string) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { mentor: { select: { fullName: true, email: true } } },
  });
  if (!course) return { error: "Course not found" as const };
  if (course.status !== CourseStatus.SUBMITTED) {
    return { error: "Only courses pending review can be approved." as const };
  }

  await db.$transaction([
    db.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        approvedById: admin.session.user.id,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    }),
    db.courseApprovalWorkflow.create({
      data: {
        courseId,
        previousStatus: CourseStatus.SUBMITTED,
        newStatus: CourseStatus.PUBLISHED,
        reviewedById: admin.session.user.id,
        note: "Published from admin review queue",
      },
    }),
  ]);

  // Send notification email to the mentor
  const baseUrl = process.env.NEXTAUTH_URL || "";
  void sendEmail({
    to: course.mentor.email!,
    subject: `Course Published: ${course.title}`,
    html: getApprovalTemplate(
      course.title,
      course.mentor.fullName,
      `${baseUrl}/student/browse/${courseId}`
    ),
  });

  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function rejectCourseAction(courseId: string, reason: string) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { error: "Please provide a clear rejection reason (at least 8 characters)." as const };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { mentor: { select: { fullName: true, email: true } } },
  });
  if (!course) return { error: "Course not found" as const };
  if (course.status !== CourseStatus.SUBMITTED) {
    return { error: "Only courses pending review can be rejected." as const };
  }

  await db.$transaction([
    db.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.REJECTED,
        rejectionReason: trimmed,
        approvedById: null,
        approvedAt: null,
      },
    }),
    db.courseApprovalWorkflow.create({
      data: {
        courseId,
        previousStatus: CourseStatus.SUBMITTED,
        newStatus: CourseStatus.REJECTED,
        reviewedById: admin.session.user.id,
        note: trimmed,
      },
    }),
  ]);

  // Send notification email to the mentor
  const baseUrl = process.env.NEXTAUTH_URL || "";
  void sendEmail({
    to: course.mentor.email!,
    subject: `Revision Required: ${course.title}`,
    html: getRejectionTemplate(
      course.title,
      course.mentor.fullName,
      trimmed,
      `${baseUrl}/mentor/courses/${courseId}/manage/curriculum`
    ),
  });

  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function deleteCourseAction(courseId: string) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  const course = await db.course.findUnique({
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
  if (!course) return { error: "Course not found" as const };

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
      await tx.aIQuestion.deleteMany({ where: { attemptId: { in: aiAttemptIds } } });
      await tx.aIQuizAttempt.deleteMany({ where: { id: { in: aiAttemptIds } } });
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
      await tx.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
      await tx.lesson.deleteMany({ where: { id: { in: lessonIds } } });
    }

    if (sectionIds.length) {
      await tx.sectionQuiz.deleteMany({ where: { sectionId: { in: sectionIds } } });
      await tx.courseSection.deleteMany({ where: { id: { in: sectionIds } } });
    }

    await tx.enrollment.deleteMany({ where: { courseId } });
    await tx.wishlist.deleteMany({ where: { courseId } });
    await tx.assignment.deleteMany({ where: { courseId } });
    await tx.courseApprovalWorkflow.deleteMany({ where: { courseId } });
    await tx.course.delete({ where: { id: courseId } });

    await tx.auditLog.create({
      data: {
        actorId: admin.session.user.id,
        action: "DELETE_COURSE",
        entityType: "Course",
        entityId: courseId,
        payload: { title: course.title },
      },
    });
  });

  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/mentor/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");

  return { success: true as const };
}
