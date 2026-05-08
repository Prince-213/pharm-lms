import { db } from "@/lib/db";
import { todayDateKey, shiftDateKey } from "@/lib/date-keys";

export type StudentStreak = {
  days: number;
  activeToday: boolean;
};

/**
 * Calculates the current activity streak for a student based on CourseVisit history.
 * A streak is active if the student visited a course today or yesterday.
 */
export async function getStudentStreak(studentId: string): Promise<StudentStreak> {
  const visits = await db.courseVisit.findMany({
    where: { studentId },
    select: { dateKey: true },
    distinct: ["dateKey"],
    orderBy: { dateKey: "desc" },
    take: 366, // Last year of activity
  });

  if (visits.length === 0) {
    return { days: 0, activeToday: false };
  }

  const dateKeys = visits.map((v) => v.dateKey);
  const set = new Set(dateKeys);
  const today = todayDateKey();
  const yesterday = shiftDateKey(today, -1);

  const activeToday = set.has(today);
  const activeYesterday = set.has(yesterday);

  // If no activity today OR yesterday, the streak is broken (0)
  if (!activeToday && !activeYesterday) {
    return { days: 0, activeToday: false };
  }

  // Start checking from whichever day is the most recent active one
  let days = 0;
  let cursor = activeToday ? today : yesterday;

  while (set.has(cursor)) {
    days++;
    cursor = shiftDateKey(cursor, -1);
  }

  return { days, activeToday };
}
