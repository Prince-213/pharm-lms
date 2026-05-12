import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireMentorCourse,
  requireMentorCourseEditable,
} from "@/lib/mentor-course-auth";

const patchCourseSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  subtitle: z.string().max(200).nullable().optional(),
  description: z.string().min(20).max(100000).optional(),
  language: z.string().max(64).nullable().optional(),
  level: z.string().max(64).nullable().optional(),
  category: z.string().max(120).nullable().optional(),
  subcategory: z.string().max(120).nullable().optional(),
  primaryTopic: z.string().max(200).nullable().optional(),
  thumbnailUrl: z.string().max(2000).nullable().optional(),
  promoVideoUrl: z.string().max(2000).nullable().optional(),
  welcomeMessage: z.string().max(100000).nullable().optional(),
  congratulatoryTitle: z.string().max(200).nullable().optional(),
  congratulatoryContentType: z.enum(["ARTICLE", "VIDEO"]).nullable().optional(),
  congratulatoryArticle: z.string().max(100000).nullable().optional(),
  congratulatoryVideoUrl: z.string().max(2000).nullable().optional(),
  priceMinorUnits: z.number().int().min(0).nullable().optional(),
  estimatedDurationMinutes: z
    .number()
    .int()
    .min(0)
    .max(100_000)
    .nullable()
    .optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const authz = await requireMentorCourse(courseId);
  if ("error" in authz) return authz.error;

  return NextResponse.json(authz.course);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const body = await request.json();
  const parsed = patchCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const congratulatoryMessage =
    data.congratulatoryTitle && data.congratulatoryArticle
      ? `${data.congratulatoryTitle}\n\n${data.congratulatoryArticle.replace(/<[^>]+>/g, " ").slice(0, 4000)}`
      : undefined;

  const updated = await db.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      language: data.language,
      level: data.level,
      category: data.category,
      subcategory: data.subcategory,
      primaryTopic: data.primaryTopic,
      thumbnailUrl: data.thumbnailUrl,
      promoVideoUrl: data.promoVideoUrl,
      welcomeMessage: data.welcomeMessage,
      congratulatoryTitle: data.congratulatoryTitle,
      congratulatoryContentType: data.congratulatoryContentType,
      congratulatoryArticle: data.congratulatoryArticle,
      congratulatoryVideoUrl: data.congratulatoryVideoUrl,
      priceMinorUnits: data.priceMinorUnits,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      ...(congratulatoryMessage ? { congratulatoryMessage } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  // Verify mentor owns course and it's editable (not SUBMITTED/APPROVED/PUBLISHED)
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  // Double-check: only DRAFT courses may be deleted
  const { CourseStatus } = await import("@/generated/prisma/enums");
  const course = await db.course.findFirst({
    where: { id: courseId },
    select: { id: true, status: true },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (course.status !== CourseStatus.DRAFT) {
    return NextResponse.json(
      { error: "Only draft courses can be deleted." },
      { status: 403 },
    );
  }

  // Full cascade delete
  await db.$transaction(async (tx) => {
    const sections = await tx.courseSection.findMany({
      where: { courseId },
      select: { id: true },
    });
    const sectionIds = sections.map((s) => s.id);

    await tx.lessonProgress.deleteMany({
      where: { lesson: { sectionId: { in: sectionIds } } },
    });
    await tx.lesson.deleteMany({ where: { sectionId: { in: sectionIds } } });
    await tx.sectionQuizAttempt.deleteMany({
      where: { quiz: { sectionId: { in: sectionIds } } },
    });
    await tx.sectionQuiz.deleteMany({
      where: { sectionId: { in: sectionIds } },
    });
    await tx.courseSection.deleteMany({ where: { courseId } });
    await tx.assignment.deleteMany({ where: { courseId } });
    await tx.wishlist.deleteMany({ where: { courseId } });
    await tx.courseVisit.deleteMany({ where: { courseId } });
    await tx.courseApprovalWorkflow.deleteMany({ where: { courseId } });
    await tx.course.delete({ where: { id: courseId } });
  });

  return NextResponse.json({ success: true });
}
