import { NextRequest, NextResponse } from "next/server";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { jsonError } from "@/lib/api/json-error";
import { requireApiRoles } from "@/lib/auth/require-api-session";
import { searchPublishedCourses } from "@/lib/courses/public-catalog";
import { db } from "@/lib/db";
import { createCourseSchema } from "@/lib/validation/lms";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);
  const category = (searchParams.get("category") ?? "").trim().slice(0, 80);
  const take = Math.min(parseInt(searchParams.get("take") ?? "6", 10) || 6, 20);

  try {
    const courses = await searchPublishedCourses({
      q: q || undefined,
      category: category || undefined,
      take,
    });

    return NextResponse.json({ courses });
  } catch (e) {
    console.error("[api/courses GET]", e);
    return jsonError(e, 500, "Could not load courses. Please try again.");
  }
}

export async function POST(request: Request) {
  const gate = await requireApiRoles(UserRole.TUTOR);
  if (gate.error) return gate.error;

  const { session } = gate;
  const mentorId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(null, 400, "Invalid request. Please try again.");
  }

  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the course details and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const description =
    parsed.data.description?.trim() ||
    "This course is a draft. Add a full description on the course landing page before you submit it for review.";

  try {
    const course = await db.course.create({
      data: {
        mentorId,
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
    console.error("[api/courses POST]", e);
    return jsonError(e, 500, "Could not create your course. Please try again.");
  }
}
