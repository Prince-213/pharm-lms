import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { loadCourseAiContextForStudent } from "@/lib/ai/load-course-ai-context";
import {
  AiConfigurationError,
  AiProviderError,
} from "@/lib/ai/huggingface-errors";
import { chatWithCourseContext } from "@/lib/ai/huggingface";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { toUserFacingError } from "@/lib/user-facing-error";

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkRateLimit(`ai:chat:${session.user.id}`, {
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

  const context = await loadCourseAiContextForStudent(courseId);
  if (!context.trim()) {
    return NextResponse.json(
      { error: "This course has no lesson content for the assistant yet." },
      { status: 400 },
    );
  }

  try {
    const reply = await chatWithCourseContext(context, message, history);
    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    const status = err instanceof AiConfigurationError ? 503 : 502;
    return NextResponse.json(
      {
        error: toUserFacingError(
          err,
          "Could not reach the course assistant. Try again shortly.",
        ),
      },
      { status },
    );
  }
}
