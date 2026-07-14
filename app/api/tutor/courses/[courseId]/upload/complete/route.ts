import { NextResponse } from "next/server";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";
import {
  requireMentorCourse,
  requireMentorCourseEditable,
} from "@/lib/mentor-course-auth";

/**
 * Called after a successful browser → R2 PUT so portal caches refresh.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  let body: { key?: string; purpose?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const key = String(body.key ?? "").trim();
  const purpose = String(body.purpose ?? "lesson-video");

  if (!key.startsWith(`courses/${courseId}/`)) {
    return NextResponse.json({ error: "Invalid upload key." }, { status: 400 });
  }

  const authz =
    purpose === "assignment-handout"
      ? await requireMentorCourse(courseId)
      : await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  revalidateCourseSurfaces(courseId);
  return NextResponse.json({ ok: true, url: `r2://${key}` });
}
