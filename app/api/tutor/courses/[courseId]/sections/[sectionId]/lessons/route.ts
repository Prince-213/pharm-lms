import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const createLessonBodySchema = z.object({
  title: z.string().min(2).max(140),
  contentType: z.enum(["VIDEO", "ARTICLE"]),
  value: z.string().max(100000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> },
) {
  const { courseId, sectionId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const section = await db.courseSection.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createLessonBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const maxPosition = await db.lesson.aggregate({
    where: { sectionId },
    _max: { position: true },
  });

  const lesson = await db.lesson.create({
    data: {
      sectionId,
      title: parsed.data.title,
      position: (maxPosition._max.position ?? 0) + 1,
      videoUrl: parsed.data.contentType === "VIDEO" ? parsed.data.value : null,
      content: parsed.data.contentType === "ARTICLE" ? parsed.data.value : null,
    },
  });

  revalidateCourseSurfaces(courseId);
  return NextResponse.json(lesson, { status: 201 });
}
