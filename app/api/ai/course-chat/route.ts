import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { chatWithCourseContext } from "@/lib/ai/huggingface";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  courseId: z.string().cuid(),
  message: z.string().min(1).max(1200),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1200),
      }),
    )
    .max(12)
    .optional(),
});

function cleanText(input: string) {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`ai:chat:${session.user.id}`, {
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

  const { courseId, message, history = [] } = parsed.data;

  const enrollment = await db.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
    select: { id: true },
  });
  if (!enrollment) {
    return NextResponse.json(
      { error: "Enroll in this course to use the assistant." },
      { status: 403 },
    );
  }

  if (!(await studentMayAccessCourseContent(session.user.id, courseId))) {
    return NextResponse.json(
      { error: "Complete payment to use the course assistant." },
      { status: 403 },
    );
  }

  const completed = await db.lessonProgress.findMany({
    where: {
      studentId: session.user.id,
      completed: true,
      lesson: { section: { courseId } },
    },
    select: { lesson: { select: { sectionId: true } } },
  });
  const sectionIds = [...new Set(completed.map((c) => c.lesson.sectionId))];
  if (!sectionIds.length) {
    return NextResponse.json(
      {
        error:
          "Complete at least one lesson to chat with context-aware assistant.",
      },
      { status: 400 },
    );
  }

  const lessons = await db.lesson.findMany({
    where: { section: { courseId, id: { in: sectionIds } } },
    select: {
      title: true,
      content: true,
      section: { select: { title: true } },
    },
    orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
  });

  const context = lessons
    .map(
      (lesson) =>
        `Section: ${lesson.section.title}\nLesson: ${lesson.title}\n${cleanText(lesson.content ?? "")}`,
    )
    .join("\n\n");

  const reply = await chatWithCourseContext(context, message, history);

  return NextResponse.json({ reply }, { status: 200 });
}
