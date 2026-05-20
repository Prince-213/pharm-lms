import { revalidatePath } from "next/cache";

import { CoursePurchaseStatus, CourseStatus } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";

export type ReEnrollPurchasedCourseResult =
  | { ok: true; courseId: string; enrollmentId: string }
  | { ok: false; message: string };

/**
 * Restores enrollment for a student who already paid but unenrolled.
 */
export async function reEnrollFromSuccessfulPurchase(
  studentId: string,
  courseId: string,
): Promise<ReEnrollPurchasedCourseResult> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true },
  });
  if (!course || course.status !== CourseStatus.PUBLISHED) {
    return { ok: false, message: "Course is not available for enrollment." };
  }

  const purchase = await db.coursePurchase.findFirst({
    where: {
      courseId,
      studentId,
      status: CoursePurchaseStatus.SUCCESS,
    },
    orderBy: { paidAt: "desc" },
    select: { id: true },
  });
  if (!purchase) {
    return { ok: false, message: "No completed purchase found for this course." };
  }

  const existing = await db.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    select: { id: true },
  });
  if (existing) {
    await db.coursePurchase.update({
      where: { id: purchase.id },
      data: { enrollmentId: existing.id },
    });
    return { ok: true, courseId, enrollmentId: existing.id };
  }

  const enrollment = await db.enrollment.create({
    data: { courseId, studentId },
  });

  await db.coursePurchase.update({
    where: { id: purchase.id },
    data: { enrollmentId: enrollment.id },
  });

  await evaluateStudentBadges(studentId);

  revalidatePath("/student/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/achievements");
  revalidatePath(`/student/browse/${courseId}`);
  revalidatePath(`/student/course/${courseId}`);

  return { ok: true, courseId, enrollmentId: enrollment.id };
}
