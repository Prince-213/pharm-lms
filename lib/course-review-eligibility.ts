import { db } from "@/lib/db";

/**
 * True if the student has fully completed at least one section: every lesson in
 * that section has completed progress. Sections with no lessons are skipped.
 */
export async function studentHasCompletedAtLeastOneFullSection(
  studentId: string,
  courseId: string,
): Promise<boolean> {
  const sections = await db.courseSection.findMany({
    where: { courseId },
    select: {
      id: true,
      lessons: { select: { id: true } },
    },
  });

  for (const section of sections) {
    if (section.lessons.length === 0) continue;
    const lessonIds = section.lessons.map((l) => l.id);
    const rows = await db.lessonProgress.findMany({
      where: {
        studentId,
        lessonId: { in: lessonIds },
        completed: true,
      },
      select: { lessonId: true },
    });
    const done = new Set(rows.map((r) => r.lessonId));
    if (lessonIds.every((id) => done.has(id))) return true;
  }

  return false;
}
