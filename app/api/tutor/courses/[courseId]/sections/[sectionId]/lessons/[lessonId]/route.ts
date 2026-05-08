import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const updateLessonBodySchema = z.object({
  title: z.string().min(2).max(140).optional(),
  contentType: z.enum(["VIDEO", "ARTICLE"]).optional(),
  value: z.string().max(100000).optional(),
});

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; sectionId: string; lessonId: string }>;
  },
) {
  const { courseId, sectionId, lessonId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, sectionId, section: { courseId } },
    select: { id: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateLessonBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const contentType = parsed.data.contentType;
  const value = parsed.data.value;
  const updated = await db.lesson.update({
    where: { id: lessonId },
    data: {
      title: parsed.data.title,
      videoUrl:
        contentType === "VIDEO"
          ? value
          : contentType === "ARTICLE"
            ? null
            : undefined,
      content:
        contentType === "ARTICLE"
          ? value
          : contentType === "VIDEO"
            ? null
            : undefined,
    },
  });

  return NextResponse.json(updated);
}
