import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";

const createLectureBodySchema = z.object({
  title: z.string().min(3).max(180),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> },
) {
  const { courseId, sectionId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { mentorId: true },
  });
  if (!course || course.mentorId !== session.user.id) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const section = await db.courseSection.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createLectureBodySchema.safeParse(body);
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
    },
  });

  revalidateCourseSurfaces(courseId);
  return NextResponse.json(lesson, { status: 201 });
}
