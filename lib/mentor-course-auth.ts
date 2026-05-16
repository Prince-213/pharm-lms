import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export { courseStatusLabel } from "@/lib/course-status-label";

export async function requireMentorCourse(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
  });

  if (!course) {
    return { error: NextResponse.json({ error: "Course not found" }, { status: 404 }) };
  }

  return { session, course };
}

export async function requireMentorDraftCourse(courseId: string) {
  const result = await requireMentorCourse(courseId);
  if ("error" in result) return result;

  if (result.course.status !== CourseStatus.DRAFT) {
    return {
      error: NextResponse.json(
        {
          error:
            "This course is locked while it is pending review or after it has been processed.",
        },
        { status: 403 },
      ),
    };
  }

  return result;
}

/** Curriculum edits and uploads — draft or resubmitting after admin rejection */
export async function requireMentorCourseEditable(courseId: string) {
  const result = await requireMentorCourse(courseId);
  if ("error" in result) return result;

  const editable =
    result.course.status === CourseStatus.DRAFT ||
    result.course.status === CourseStatus.REJECTED;
  if (!editable) {
    return {
      error: NextResponse.json(
        {
          error:
            "This course is locked while it is pending review, approved, or already published.",
        },
        { status: 403 },
      ),
    };
  }

  return result;
}
