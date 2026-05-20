"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CoursePurchaseStatus, CourseStatus, UserRole } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";

export type EnrollResult =
  | { ok: true; courseId: string }
  | { ok: false; message: string };

export async function enrollInCourseAction(
  courseId: string,
): Promise<EnrollResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Sign in with a student account to enroll." };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true, priceMinorUnits: true },
  });
  if (!course || course.status !== CourseStatus.PUBLISHED) {
    return {
      ok: false,
      message: "This course is not open for enrollment yet.",
    };
  }

  const existing = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
  });
  if (existing) {
    return { ok: true, courseId };
  }

  const price = course.priceMinorUnits ?? 0;
  let purchaseId: string | null = null;
  if (price > 0) {
    const paid = await db.coursePurchase.findFirst({
      where: {
        courseId,
        studentId: session.user.id,
        status: CoursePurchaseStatus.SUCCESS,
      },
      select: { id: true },
      orderBy: { paidAt: "desc" },
    });
    if (!paid) {
      return {
        ok: false,
        message: "Complete payment to enroll in this course.",
      };
    }
    purchaseId = paid.id;
  }

  let enrollmentId: string;
  try {
    const enrollment = await db.enrollment.create({
      data: {
        courseId,
        studentId: session.user.id,
      },
    });
    enrollmentId = enrollment.id;
  } catch (e) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code: string }).code)
        : "";
    if (code === "P2002") {
      return { ok: true, courseId };
    }
    throw e;
  }

  if (purchaseId) {
    await db.coursePurchase.update({
      where: { id: purchaseId },
      data: { enrollmentId },
    });
  }

  await evaluateStudentBadges(session.user.id);

  revalidatePath("/student/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/achievements");
  return { ok: true, courseId };
}

export type UnenrollResult =
  | { ok: true; courseId: string }
  | { ok: false; message: string };

export async function unenrollFromCourseAction(
  courseId: string,
): Promise<UnenrollResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Sign in with a student account to continue." };
  }
  if (!courseId || typeof courseId !== "string") {
    return { ok: false, message: "Invalid course." };
  }

  try {
    await db.enrollment.deleteMany({
      where: { courseId, studentId: session.user.id },
    });
  } catch (error) {
    console.error("unenrollFromCourseAction failed", error);
    return { ok: false, message: "Could not unenroll. Please try again." };
  }

  revalidatePath("/student/courses");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/achievements");
  return { ok: true, courseId };
}
