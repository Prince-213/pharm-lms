"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CourseStatus, UserRole, EnrollmentStatus } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";

export type ProgressResult = { ok: true } | { ok: false; message: string };

export async function setLessonCompletedAction(
  courseId: string,
  lessonId: string,
  completed: boolean,
): Promise<ProgressResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Unauthorized" };
  }

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          course: { select: { id: true, status: true } },
        },
      },
    },
  });
  if (!lesson || lesson.section.course.id !== courseId) {
    return { ok: false, message: "Lesson not found." };
  }
  if (lesson.section.course.status !== CourseStatus.PUBLISHED) {
    return { ok: false, message: "Course is not available." };
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
  });
  if (!enrollment) {
    return { ok: false, message: "Enroll in this course first." };
  }

  await db.lessonProgress.upsert({
    where: {
      lessonId_studentId: { lessonId, studentId: session.user.id },
    },
    create: {
      lessonId,
      studentId: session.user.id,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  if (completed) {
    await evaluateStudentBadges(session.user.id);
    revalidatePath("/student/achievements");
  }

  revalidatePath(`/student/course/${courseId}`);
  return { ok: true };
}

export async function completeCourseAction(
  courseId: string,
): Promise<ProgressResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Unauthorized" };
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
  });

  if (!enrollment) {
    return { ok: false, message: "Enrollment not found." };
  }

  if (enrollment.status === EnrollmentStatus.COMPLETED) {
    return { ok: true };
  }

  await db.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: EnrollmentStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  await evaluateStudentBadges(session.user.id);
  
  revalidatePath(`/student/course/${courseId}`);
  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");
  
  return { ok: true };
}
