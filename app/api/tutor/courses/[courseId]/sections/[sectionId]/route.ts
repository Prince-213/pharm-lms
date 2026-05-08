import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const updateSectionBodySchema = z.object({
  title: z.string().min(3).max(120).optional(),
  position: z.number().int().positive().optional(),
  description: z.string().max(100000).nullable().optional(),
});


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> },
) {
  const { courseId, sectionId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const body = await request.json();
  const parsed = updateSectionBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const section = await db.courseSection.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const updated = await db.courseSection.update({
    where: { id: sectionId },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.position !== undefined ? { position: parsed.data.position } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
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

  await db.$transaction([
    db.lesson.deleteMany({ where: { sectionId } }),
    db.sectionQuiz.deleteMany({ where: { sectionId } }),
    db.courseSection.delete({ where: { id: sectionId } }),
  ]);

  return NextResponse.json({ success: true });
}
