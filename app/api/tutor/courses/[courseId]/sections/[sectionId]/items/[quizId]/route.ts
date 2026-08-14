import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";
import { deriveQuizTitle } from "@/lib/curriculum/derive-quiz-title";
import { quizQuestionsSchema } from "@/lib/curriculum/mcq-question-schema";
import { db } from "@/lib/db";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";

const updateQuizBodySchema = z.object({
  quizQuestions: quizQuestionsSchema,
});

async function findOwnedQuiz(
  courseId: string,
  sectionId: string,
  quizId: string,
) {
  return db.sectionQuiz.findFirst({
    where: {
      id: quizId,
      sectionId,
      section: { id: sectionId, courseId },
    },
    select: { id: true },
  });
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; sectionId: string; quizId: string }>;
  },
) {
  const { courseId, sectionId, quizId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const quiz = await findOwnedQuiz(courseId, sectionId, quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateQuizBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const questions = parsed.data.quizQuestions;
  const updated = await db.sectionQuiz.update({
    where: { id: quizId },
    data: {
      title: deriveQuizTitle(questions),
      questions,
    },
  });

  revalidateCourseSurfaces(courseId);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ courseId: string; sectionId: string; quizId: string }>;
  },
) {
  const { courseId, sectionId, quizId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const quiz = await findOwnedQuiz(courseId, sectionId, quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  await db.$transaction([
    db.sectionQuizAttempt.deleteMany({ where: { quizId } }),
    db.sectionQuiz.delete({ where: { id: quizId } }),
  ]);

  revalidateCourseSurfaces(courseId);
  return NextResponse.json({ ok: true });
}
