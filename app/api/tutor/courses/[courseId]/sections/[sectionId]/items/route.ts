import { NextResponse } from "next/server";
import { z } from "zod";
import { AssignmentStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const mcqQuestionSchema = z
  .object({
    kind: z.literal("multiple_choice"),
    prompt: z.string().min(1).max(500),
    correctAnswer: z.string().min(1).max(300),
    incorrectOptions: z.tuple([
      z.string().min(1).max(300),
      z.string().min(1).max(300),
      z.string().min(1).max(300),
    ]),
  })
  .superRefine((q, ctx) => {
    const all = [q.correctAnswer, ...q.incorrectOptions];
    if (new Set(all.map((s) => s.trim().toLowerCase())).size !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Each question needs four distinct options (correct answer plus three different distractors).",
      });
    }
  });

const DEFAULT_MCQ_QUESTIONS = [
  {
    kind: "multiple_choice" as const,
    prompt: "What is the key takeaway from this section?",
    correctAnswer: "The core concept explained in the section lessons.",
    incorrectOptions: [
      "An unrelated administrative requirement.",
      "A workflow from a different course entirely.",
      "There is no single takeaway.",
    ],
  },
  {
    kind: "multiple_choice" as const,
    prompt: "Which statement best reflects the material above?",
    correctAnswer: "It aligns with the skills and outcomes described in this section.",
    incorrectOptions: [
      "It contradicts every lesson in this section.",
      "It applies only to unrelated regulatory paperwork.",
      "None of the readings support any conclusion.",
    ],
  },
];

const createItemBodySchema = z.object({
  itemType: z.enum(["QUIZ", "ASSIGNMENT"]),
  title: z.string().min(2).max(140),
  quizQuestions: z.array(mcqQuestionSchema).min(1).max(20).optional(),
  assignmentDescription: z.string().max(5000).optional(),
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
    const questions =
      parsed.data.quizQuestions && parsed.data.quizQuestions.length > 0
        ? parsed.data.quizQuestions
        : DEFAULT_MCQ_QUESTIONS;
    const quiz = await db.sectionQuiz.create({
      data: {
        sectionId,
        title: parsed.data.title,
        questions,
      },
    });
    revalidateCourseSurfaces(courseId);
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
      dueDate: null,
    },
  });

  revalidateCourseSurfaces(courseId);
  return NextResponse.json(
    { itemType: "ASSIGNMENT", item: assignment },
    { status: 201 },
  );
}
