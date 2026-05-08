import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";

const schema = z.object({
  quizId: z.string().min(1).max(80),
  answers: z.record(z.string(), z.string().max(2000)),
});

type ParsedQuestion = {
  prompt: string;
  expectedAnswer: string | null;
};

function parseQuestion(raw: unknown): ParsedQuestion | null {
  if (typeof raw === "string") {
    const parts = raw.split(/\s*(?:\|\||::|=>)\s*/);
    let rawPrompt = parts[0]?.trim() || "";
    const expectedAnswer = parts[1]?.trim() || null;

    if (!rawPrompt) return null;

    // Support for [Badge] Question format
    const badgeMatch = rawPrompt.match(/^\[(.*?)\]\s*(.*)$/);
    let prompt = rawPrompt;
    let fallbackAnswer: string | null = null;

    if (badgeMatch) {
      const bText = badgeMatch[1].trim();
      const pText = badgeMatch[2].trim();

      if (bText && pText && !expectedAnswer) {
        prompt = bText;
        fallbackAnswer = pText;
      } else {
        prompt = pText || rawPrompt;
      }
    }

    return {
      prompt,
      expectedAnswer: expectedAnswer || fallbackAnswer,
    };
  }
  if (raw && typeof raw === "object") {
    const maybe = raw as { question?: unknown; answer?: unknown };
    if (typeof maybe.question === "string" && maybe.question.trim()) {
      return {
        prompt: maybe.question.trim(),
        expectedAnswer:
          typeof maybe.answer === "string" && maybe.answer.trim()
            ? maybe.answer.trim()
            : null,
      };
    }
  }
  return null;
}

function parseQuestions(value: unknown): ParsedQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseQuestion)
    .filter((q): q is ParsedQuestion => Boolean(q));
}

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

  const questions = parseQuestions(quiz.questions);
  const graded = questions.map((q, index) => {
    const userAnswer = (parsed.data.answers[String(index)] ?? "").trim();
    const isCorrect = q.expectedAnswer
      ? userAnswer.toLowerCase() === q.expectedAnswer.toLowerCase()
      : null;
    return { ...q, userAnswer, isCorrect };
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
