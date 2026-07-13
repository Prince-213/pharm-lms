import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseAssignmentDescription } from "@/lib/assignments/parse-assignment-description";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";
import { requireMentorCourse, requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const createSectionBodySchema = z.object({
  title: z.string().min(3).max(120),
  objective: z.string().max(500).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const authz = await requireMentorCourse(courseId);
  if ("error" in authz) return authz.error;

  const sections = await db.courseSection.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
      quizzes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const assignments = await db.assignment.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      status: true,
    },
  });

  const sectionsWithAssignments = sections.map((section) => ({
    ...section,
    assignmentItems: assignments
      .filter((assignment) =>
        assignment.description?.includes(`Section:${section.id}`),
      )
      .map((assignment) => {
        const { instructions } = parseAssignmentDescription(
          assignment.description,
        );
        return {
          ...assignment,
          description: instructions,
        };
      }),
  }));

  return NextResponse.json({ sections: sectionsWithAssignments });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const body = await request.json();
  const parsed = createSectionBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const maxPosition = await db.courseSection.aggregate({
    where: { courseId },
    _max: { position: true },
  });

  const section = await db.courseSection.create({
    data: {
      courseId,
      title: parsed.data.title,
      description: parsed.data.objective,
      position: (maxPosition._max.position ?? 0) + 1,
    },
  });

  revalidateCourseSurfaces(courseId);
  return NextResponse.json(section, { status: 201 });
}
