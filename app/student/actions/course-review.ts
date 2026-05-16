"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { studentHasCompletedAtLeastOneFullSection } from "@/lib/course-review-eligibility";
import { emailTutorCourseReview } from "@/lib/course-review-emails";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { EnrollmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";

const reviewSchema = z.object({
  courseId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(4000).optional(),
});

export type UpsertCourseReviewInput = z.infer<typeof reviewSchema>;

export type UpsertCourseReviewResult =
  | { ok: true }
  | { ok: false; message: string };

export async function upsertCourseReviewAction(
  input: UpsertCourseReviewInput,
): Promise<UpsertCourseReviewResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Sign in as a student to leave a review." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { courseId, rating, comment } = parsed.data;
  const commentTrimmed = comment?.trim() || null;

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
    select: { status: true },
  });

  if (
    !enrollment ||
    (enrollment.status !== EnrollmentStatus.ACTIVE &&
      enrollment.status !== EnrollmentStatus.COMPLETED)
  ) {
    return {
      ok: false,
      message: "You must be enrolled on this course to leave a review.",
    };
  }

  if (!(await studentMayAccessCourseContent(session.user.id, courseId))) {
    return {
      ok: false,
      message: "Complete payment before leaving a review.",
    };
  }

  const eligible = await studentHasCompletedAtLeastOneFullSection(
    session.user.id,
    courseId,
  );
  if (!eligible) {
    return {
      ok: false,
      message:
        "Complete every lesson in at least one section before leaving a review.",
    };
  }

  const course = await db.course.findFirst({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      mentorId: true,
      mentor: { select: { email: true, fullName: true } },
    },
  });
  if (!course) {
    return { ok: false, message: "Course not found." };
  }

  const student = await db.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true },
  });

  const prior = await db.courseReview.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
    select: { id: true },
  });

  await db.courseReview.upsert({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
    create: {
      courseId,
      studentId: session.user.id,
      rating,
      comment: commentTrimmed,
    },
    update: {
      rating,
      comment: commentTrimmed,
    },
  });

  const href = "/tutor/performance/reviews";
  if (!prior) {
    await db.notification.create({
      data: {
        userId: course.mentorId,
        kind: "COURSE_REVIEW_RECEIVED",
        title: `New review: ${course.title}`,
        body: `${student?.fullName ?? "A student"} rated ${rating}★.`,
        href,
      },
    });

    void emailTutorCourseReview({
      mentorEmail: course.mentor.email,
      mentorName: course.mentor.fullName,
      studentName: student?.fullName ?? "Student",
      courseTitle: course.title,
      rating,
      commentSnippet: commentTrimmed,
    });
  }

  revalidatePath(`/student/course/${courseId}`);
  revalidatePath(href);
  void evaluateStudentBadges(session.user.id);
  return { ok: true };
}
