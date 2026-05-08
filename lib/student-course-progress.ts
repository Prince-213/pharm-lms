import { db } from "@/lib/db";
import { cache } from "react";

export const getEnrollmentProgressForStudent = cache(async function (
  studentId: string,
  courseIds: string[],
): Promise<Map<string, { completed: number; total: number; pct: number }>> {
  const result = new Map<string, { completed: number; total: number; pct: number }>();
  if (courseIds.length === 0) return result;

  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: {
      id: true,
      sections: {
        select: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  const totals = new Map<string, number>();
  for (const c of courses) {
    const total = c.sections.reduce((n, s) => n + s._count.lessons, 0);
    totals.set(c.id, total);
  }

  const completedRows = await db.lessonProgress.findMany({
    where: {
      studentId,
      completed: true,
      lesson: { section: { courseId: { in: courseIds } } },
    },
    select: {
      lesson: { select: { section: { select: { courseId: true } } } },
    },
  });

  const completedByCourse = new Map<string, number>();
  for (const row of completedRows) {
    const cid = row.lesson.section.courseId;
    completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
  }

  for (const id of courseIds) {
    const total = totals.get(id) ?? 0;
    const completed = completedByCourse.get(id) ?? 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    result.set(id, { completed, total, pct });
  }

  return result;
});
