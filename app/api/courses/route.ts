import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { createCourseSchema } from "@/lib/validation/lms";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const description =
    parsed.data.description?.trim() ||
    "This course is a draft. Add a full description on the course landing page before you submit it for review.";

  try {
    const course = await db.course.create({
      data: {
        mentorId: session.user.id,
        title: parsed.data.title.trim(),
        subtitle: parsed.data.subtitle?.trim() || null,
        description,
        language: parsed.data.language?.trim() || "English",
        level: parsed.data.level?.trim() || null,
        category: parsed.data.category?.trim() || null,
        status: CourseStatus.DRAFT,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Database error while creating course.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
