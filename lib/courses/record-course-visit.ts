import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { todayDateKey } from "@/lib/date-keys";

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && (error as { code: string }).code === "P2002") {
    return true;
  }
  return false;
}

/**
 * Idempotently logs that a student opened a course today. The unique constraint
 * `(studentId, courseId, dateKey)` ensures at most one row per student/course
 * per UTC day, so this can be called on every page render cheaply.
 *
 * Errors are swallowed on purpose — a failed visit log must never break the
 * course page render.
 */
export async function recordCourseVisit(
  studentId: string,
  courseId: string,
): Promise<void> {
  if (!studentId || !courseId) return;
  const dateKey = todayDateKey();
  try {
    await withDbRetry(() =>
      db.courseVisit.create({
        data: { studentId, courseId, dateKey },
      }),
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) return;
    console.error("recordCourseVisit failed", error);
  }
}
