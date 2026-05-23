import { UserRole } from "@/generated/prisma/enums";
import { todayDateKey, shiftDateKey } from "@/lib/date-keys";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export type LeaderboardEntry = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  rank: number;
  streak: number;
  badges: number;
  lessons: number;
  quizPoints: number;
  isCurrentUser?: boolean;
};

/**
 * Calculates current streak for a list of date keys.
 */
function calculateCurrentStreak(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0;
  const set = new Set(dateKeys);
  const today = todayDateKey();
  const yesterday = shiftDateKey(today, -1);

  if (!set.has(today) && !set.has(yesterday)) return 0;

  let streak = 0;
  let cursor = set.has(today) ? today : yesterday;
  while (set.has(cursor)) {
    streak++;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export async function getLeaderboardData(currentUserId?: string): Promise<{
  entries: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
}> {
  // 1. Fetch all students
  const students = await db.user.findMany({
    where: { role: UserRole.STUDENT, isActive: true },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      _count: {
        select: {
          achievements: true, // Badges
          lessonProgress: { where: { completed: true } },
        },
      },
    },
  });

  // 2. Fetch quiz scores (aggregate)
  const quizScores = await db.sectionQuizAttempt.groupBy({
    by: ["studentId"],
    _sum: { score: true },
  });

  const aiQuizScores = await db.aIQuizAttempt.groupBy({
    by: ["studentId"],
    _sum: { score: true },
  });

  const quizMap = new Map<string, number>();
  quizScores.forEach((s) => quizMap.set(s.studentId, (quizMap.get(s.studentId) || 0) + (s._sum.score || 0)));
  aiQuizScores.forEach((s) => quizMap.set(s.studentId, (quizMap.get(s.studentId) || 0) + (s._sum.score || 0)));

  // 3. Fetch all visits to calculate streaks (limited to recent to keep it fast)
  // Actually, we need historical visits to find the streak start. 
  // Let's take visits from the last 60 days.
  const sixtyDaysAgo = shiftDateKey(todayDateKey(), -60);
  const visits = await db.courseVisit.findMany({
    where: { dateKey: { gte: sixtyDaysAgo } },
    select: { studentId: true, dateKey: true },
    distinct: ["studentId", "dateKey"],
  });

  const visitMap = new Map<string, string[]>();
  visits.forEach((v) => {
    const list = visitMap.get(v.studentId) || [];
    list.push(v.dateKey);
    visitMap.set(v.studentId, list);
  });

  // 4. Assemble entries and calculate points
  let entries: LeaderboardEntry[] = students.map((s) => {
    const badgePoints = s._count.achievements * 50;
    const lessonPoints = s._count.lessonProgress * 10;
    const quizPoints = Math.round(quizMap.get(s.id) || 0);
    const streak = calculateCurrentStreak(visitMap.get(s.id) || []);
    const streakPoints = streak * 5;

    const totalPoints = badgePoints + lessonPoints + quizPoints + streakPoints;

    return {
      id: s.id,
      fullName: s.fullName,
      avatarUrl: s.avatarUrl,
      points: totalPoints,
      rank: 0, // Assigned later
      streak,
      badges: s._count.achievements,
      lessons: s._count.lessonProgress,
      quizPoints,
      isCurrentUser: s.id === currentUserId,
    };
  });

  // 5. Sort and assign rank
  entries.sort((a, b) => b.points - a.points);
  entries = entries.map((e, index) => ({ ...e, rank: index + 1 }));

  entries = await Promise.all(
    entries.map(async (e) => ({
      ...e,
      avatarUrl: await resolveMediaUrl(e.avatarUrl),
    })),
  );

  const currentUser = entries.find((e) => e.isCurrentUser) || null;

  return {
    entries: entries.slice(0, 50), // Show top 50
    currentUser,
  };
}
