import { NextResponse } from "next/server";
import { z } from "zod";
import { AssignmentStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const createItemBodySchema = z.object({
  itemType: z.enum(["QUIZ", "ASSIGNMENT"]),
  title: z.string().min(2).max(140),
  quizQuestions: z.array(z.string().min(1).max(300)).max(20).optional(),
  assignmentDescription: z.string().max(5000).optional(),
  dueDays: z.number().int().min(1).max(365).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> },
) {
  const { courseId, sectionId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;
  const { session } = authz;

  const section = await db.courseSection.findFirst({
    where: { id: sectionId, courseId },
    select: { id: true },
  });
  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createItemBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.itemType === "QUIZ") {
    const questions = parsed.data.quizQuestions?.length
      ? parsed.data.quizQuestions
      : [
          "What is the key concept in this section?",
          "Which best practice applies here?",
        ];
    const quiz = await db.sectionQuiz.create({
      data: {
        sectionId,
        title: parsed.data.title,
        questions,
      },
    });
    return NextResponse.json({ itemType: "QUIZ", item: quiz }, { status: 201 });
  }

  const assignmentBody = parsed.data.assignmentDescription?.trim() ?? "";
  const assignment = await db.assignment.create({
    data: {
      courseId,
      createdById: session.user.id,
      title: parsed.data.title,
      description: `Section:${sectionId}\n${assignmentBody}`,
      status: AssignmentStatus.DRAFT,
      dueDate: new Date(
        Date.now() + (parsed.data.dueDays ?? 7) * 24 * 60 * 60 * 1000,
      ),
    },
  });

  return NextResponse.json(
    { itemType: "ASSIGNMENT", item: assignment },
    { status: 201 },
  );
}
