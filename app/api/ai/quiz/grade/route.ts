import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { gradeQuiz } from "@/lib/ai/huggingface";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  attemptId: z.string().cuid(),
  answers: z.array(z.string().max(500)).min(1).max(20),
});

type GradeQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkRateLimit(`ai:grade:${session.user.id}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const attempt = await db.aIQuizAttempt.findFirst({
    where: { id: parsed.data.attemptId, studentId: session.user.id },
    include: { questions: true },
  });
  if (!attempt) {
    return NextResponse.json(
      { error: "Quiz attempt not found." },
      { status: 404 },
    );
  }

  const attemptQuestions = [...attempt.questions].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  const questions: GradeQuestion[] = attemptQuestions.map((q) => ({
    question: q.question,
    options: Array.isArray(q.options)
      ? (q.options.filter(
          (o): o is string => typeof o === "string",
        ) as string[])
      : [],
    answer: q.correctAnswer,
    explanation: q.explanation ?? "",
  }));

  const graded = gradeQuiz(questions, parsed.data.answers);

  await db.$transaction(async (tx) => {
    if (attempt.questions.length) {
      await tx.aIAnswerReview.deleteMany({
        where: { questionId: { in: attemptQuestions.map((q) => q.id) } },
      });
      await tx.aIAnswerReview.createMany({
        data: attemptQuestions.map((q, index) => ({
          questionId: q.id,
          userAnswer: parsed.data.answers[index] ?? "",
          isCorrect: graded.reviews[index]?.isCorrect ?? false,
          feedback: graded.reviews[index]?.explanation ?? null,
        })),
      });
    }
    await tx.aIQuizAttempt.update({
      where: { id: attempt.id },
      data: { score: graded.score },
    });
  });

  await evaluateStudentBadges(session.user.id);
  revalidatePath("/student/achievements");

  return NextResponse.json(
    {
      attemptId: attempt.id,
      score: graded.score,
      reviews: graded.reviews,
    },
    { status: 200 },
  );
}
