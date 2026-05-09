import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";
import { gradeSubmission, normalizeQuizQuestions } from "@/lib/section-quiz-questions";

const schema = z.object({
  quizId: z.string().min(1).max(80),
  answers: z.record(z.string(), z.string().max(2000)),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const quiz = await db.sectionQuiz.findUnique({
    where: { id: parsed.data.quizId },
    include: {
      section: { select: { courseId: true } },
    },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: quiz.section.courseId,
        studentId: session.user.id,
      },
    },
    select: { id: true },
  });
  if (!enrollment) {
    return NextResponse.json(
      { error: "Enroll in this course to submit the quiz." },
      { status: 403 },
    );
  }

  const questions = normalizeQuizQuestions(quiz.questions);
  const graded = questions.map((q, index) => {
    const userAnswer = (parsed.data.answers[String(index)] ?? "").trim();
    const isCorrect = gradeSubmission(q, userAnswer);
    return { userAnswer, isCorrect };
  });

  const gradable = graded.filter((g) => g.isCorrect !== null);
  const score = gradable.length
    ? Math.round(
        (gradable.filter((g) => g.isCorrect).length / gradable.length) * 100,
      )
    : 0;

  const attempt = await db.sectionQuizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: session.user.id,
      answers: parsed.data.answers,
      score,
    },
    select: { id: true },
  });

  await evaluateStudentBadges(session.user.id);
  revalidatePath("/student/achievements");

  return NextResponse.json(
    {
      attemptId: attempt.id,
      score,
      hasAnswerKey: gradable.length > 0,
    },
    { status: 201 },
  );
}
