import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  tutorDeleteCourse,
  type TutorDeleteCourseErrorCode,
} from "@/lib/courses/tutor-delete-course";
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

const deleteCourseSchema = z.object({
  confirmText: z.string().min(1),
});

function deleteErrorMessage(code: TutorDeleteCourseErrorCode): string {
  switch (code) {
    case "NOT_FOUND":
      return "Course not found.";
    case "LOCKED_STATUS":
      return "Only draft or rejected courses can be deleted.";
    case "HAS_SALES":
      return "Courses with successful purchases cannot be deleted.";
    case "CONFIRM_MISMATCH":
      return "Course name does not match.";
  }
}

function deleteErrorStatus(code: TutorDeleteCourseErrorCode): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "CONFIRM_MISMATCH":
      return 400;
    default:
      return 403;
  }
}

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
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const authz = await requireMentorCourse(courseId);
  if ("error" in authz) return authz.error;

  const body = await request.json().catch(() => null);
  const parsed = deleteCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Type the exact course name to confirm deletion." },
      { status: 400 },
    );
  }

  const result = await tutorDeleteCourse(
    authz.session.user.id,
    courseId,
    parsed.data.confirmText,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: deleteErrorMessage(result.error) },
      { status: deleteErrorStatus(result.error) },
    );
  }

  return NextResponse.json({ success: true, title: result.title });
}
