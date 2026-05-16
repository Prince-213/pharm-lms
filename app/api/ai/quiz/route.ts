import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { generateSectionQuiz } from "@/lib/ai/huggingface";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";

const schema = z.object({
  courseId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
  source: z.enum(["section", "completed"]).default("completed"),
  questionCount: z.number().int().min(3).max(12).default(4),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: parsed.data.courseId,
        studentId: session.user.id,
      },
    },
    select: { id: true },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Enroll in this course to generate a quiz." }, { status: 403 });
  }

  if (
    !(await studentMayAccessCourseContent(session.user.id, parsed.data.courseId))
  ) {
    return NextResponse.json(
      { error: "Complete payment to generate a quiz." },
      { status: 403 },
    );
  }

  let sectionIds: string[] = [];
  if (parsed.data.source === "section") {
    if (!parsed.data.sectionId) {
      return NextResponse.json({ error: "sectionId is required for section mode." }, { status: 400 });
    }
    sectionIds = [parsed.data.sectionId];
  } else {
    const completed = await db.lessonProgress.findMany({
      where: {
        studentId: session.user.id,
        completed: true,
        lesson: { section: { courseId: parsed.data.courseId } },
      },
      select: { lesson: { select: { sectionId: true } } },
    });
    sectionIds = [...new Set(completed.map((c) => c.lesson.sectionId))];
    if (!sectionIds.length) {
      return NextResponse.json(
        { error: "Complete at least one lesson to generate a personalized quiz." },
        { status: 400 },
      );
    }
  }

  const lessons = await db.lesson.findMany({
    where: { section: { courseId: parsed.data.courseId, id: { in: sectionIds } } },
    select: {
      title: true,
      content: true,
      section: { select: { title: true } },
    },
    orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
  });
  if (!lessons.length) {
    return NextResponse.json({ error: "No lesson content found for quiz generation." }, { status: 400 });
  }

  const sectionContext = lessons
    .map((lesson) => `Section: ${lesson.section.title}\nLesson: ${lesson.title}\n${lesson.content ?? ""}`)
    .join("\n\n");

  let questions;
  try {
    questions = await generateSectionQuiz(sectionContext, parsed.data.questionCount);
  } catch {
    return NextResponse.json(
      { error: "Quiz generation is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
  if (!questions.length) {
    return NextResponse.json(
      { error: "Could not generate quiz questions from this content yet." },
      { status: 503 },
    );
  }

  const attempt = await db.aIQuizAttempt.create({
    data: {
      studentId: session.user.id,
      courseId: parsed.data.courseId,
      sectionId: parsed.data.source === "section" ? parsed.data.sectionId ?? null : null,
      promptSource: {
        source: parsed.data.source,
        sectionIds,
        contextCharCount: sectionContext.length,
      },
      questions: {
        create: questions.map((question) => ({
          question: question.question,
          options: question.options,
          correctAnswer: question.answer,
          explanation: question.explanation,
        })),
      },
    },
    include: { questions: true },
  });

  return NextResponse.json(attempt, { status: 201 });
}
