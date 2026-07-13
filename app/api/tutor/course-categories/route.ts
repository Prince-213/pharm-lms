import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/enums";
import { jsonError } from "@/lib/api/json-error";
import { requireApiRoles } from "@/lib/auth/require-api-session";
import {
  mergeCategoryOptions,
  SUGGESTED_COURSE_CATEGORIES,
} from "@/lib/courses/course-category-options";
import { listDistinctCourseCategories } from "@/lib/courses/list-distinct-course-categories";

export async function GET() {
  const gate = await requireApiRoles(UserRole.TUTOR);
  if (gate.error) return gate.error;

  try {
    const existing = await listDistinctCourseCategories();
    const categories = mergeCategoryOptions(
      SUGGESTED_COURSE_CATEGORIES,
      existing,
    );
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("[api/tutor/course-categories GET]", e);
    return jsonError(e, 500, "Could not load categories. Please try again.");
  }
}
