"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { deleteCourseGraph, DELETE_COURSE_TRANSACTION_OPTIONS } from "@/lib/courses/delete-course-graph";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email-service";
import { getApprovalTemplate, getRejectionTemplate } from "@/lib/notifications/email-templates";
import {
  notifyTutorCourseApproved,
  notifyTutorCourseRejected,
} from "@/lib/notifications/course-events";

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
    include: { mentor: { select: { id: true, fullName: true, email: true } } },
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

  void notifyTutorCourseApproved(course.mentor.id, courseId, course.title);

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
    include: { mentor: { select: { id: true, fullName: true, email: true } } },
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

  void notifyTutorCourseRejected(
    course.mentor.id,
    courseId,
    course.title,
    trimmed,
  );

  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function deleteCourseAction(courseId: string) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  const deleted = await db.$transaction(async (tx) => {
    const result = await deleteCourseGraph(tx, courseId);
    if (!result.ok) return null;
    await tx.auditLog.create({
      data: {
        actorId: admin.session.user.id,
        action: "DELETE_COURSE",
        entityType: "Course",
        entityId: courseId,
        payload: { title: result.title },
      },
    });
    return result;
  }, DELETE_COURSE_TRANSACTION_OPTIONS);
  if (!deleted) return { error: "Course not found" as const };

  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/dashboard");
  revalidatePath("/mentor/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");

  return { success: true as const };
}
