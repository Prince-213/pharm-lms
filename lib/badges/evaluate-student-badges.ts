import { MeetingStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { shiftDateKey } from "@/lib/date-keys";

/**
 * Default rule types supported by the evaluator. Adding a new rule means
 * extending {@link evaluateRule} below; existing badges with unknown rule
 * types are ignored so the engine keeps running.
 */
export type BadgeRuleType =
  | "first_enrollment"
  | "course_count"
  | "lessons_completed_count"
  | "ai_quiz_attempts"
  | "section_quiz_attempts"
  | "ai_quizzes_generated"
  | "perfect_quiz_score"
  | "course_streak_days"
  | "ai_quiz_min_score"
  | "mentor_meetings_completed";

type StudentStats = {
  enrollments: number;
  completedLessons: number;
  aiQuizAttempts: number;
  sectionQuizAttempts: number;
  perfectQuizzes: number;
  longestCourseStreakDays: number;
  aiQuizScores: number[];
  completedMentorMeetings: number;
};

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function aiQuizzesAtLeast(
  minScore: number,
  minQuizzes: number,
  stats: StudentStats,
): boolean {
  let count = 0;
  for (const s of stats.aiQuizScores) {
    if (s >= minScore) count++;
    if (count >= minQuizzes) return true;
  }
  return false;
}

function evaluateRule(
  ruleType: string,
  ruleConfig: unknown,
  stats: StudentStats,
): boolean {
  const config =
    ruleConfig && typeof ruleConfig === "object"
      ? (ruleConfig as Record<string, unknown>)
      : {};

  switch (ruleType as BadgeRuleType) {
    case "first_enrollment":
      return stats.enrollments >= asNumber(config.minCourses, 1);
    case "course_count":
      return stats.enrollments >= asNumber(config.minCourses, 1);
    case "lessons_completed_count":
      return stats.completedLessons >= asNumber(config.minLessons, 1);
    case "ai_quiz_attempts":
      return stats.aiQuizAttempts >= asNumber(config.minAttempts, 1);
    case "section_quiz_attempts":
      return stats.sectionQuizAttempts >= asNumber(config.minAttempts, 1);
    case "ai_quizzes_generated":
      return stats.aiQuizAttempts >= asNumber(config.minQuizzes, 3);
    case "perfect_quiz_score":
      return stats.perfectQuizzes >= asNumber(config.minPerfect, 1);
    case "course_streak_days":
      return stats.longestCourseStreakDays >= asNumber(config.minStreakDays, 3);
    case "ai_quiz_min_score":
      return aiQuizzesAtLeast(
        asNumber(config.minScore, 50),
        asNumber(config.minQuizzes, 1),
        stats,
      );
    case "mentor_meetings_completed":
      return stats.completedMentorMeetings >= asNumber(config.minMeetings, 1);
    default:
      return false;
  }
}

export type AwardedBadgeInfo = {
  id: string;
  name: string;
  iconUrl: string | null;
};

/**
 * Awards any {@link Badge} a student now qualifies for. Idempotent: existing
 * StudentBadge rows are skipped via a unique constraint, and the function
 * never throws — badge errors must not break enrollment / progress writes.
 */
export async function evaluateStudentBadges(studentId: string): Promise<{
  awarded: AwardedBadgeInfo[];
}> {
  if (!studentId) return { awarded: [] };

  try {
    return await withDbRetry(async () => {
      const [badges, stats, alreadyAwarded] = await Promise.all([
        db.badge.findMany({
          select: { id: true, name: true, iconUrl: true, ruleType: true, ruleConfig: true },
        }),
        loadStudentStats(studentId),
        db.studentBadge.findMany({
          where: { studentId },
          select: { badgeId: true },
        }),
      ]);

      const owned = new Set(alreadyAwarded.map((b) => b.badgeId));
      const toAward = badges
        .filter((b) => !owned.has(b.id))
        .filter((b) => evaluateRule(b.ruleType, b.ruleConfig, stats))
        .map((b) => ({ badgeId: b.id, studentId, name: b.name, iconUrl: b.iconUrl }));

      if (toAward.length === 0) return { awarded: [] };

      await db.studentBadge.createMany({
        data: toAward.map((b) => ({ badgeId: b.badgeId, studentId: b.studentId })),
        skipDuplicates: true,
      });
      return {
        awarded: toAward.map((b) => ({ id: b.badgeId, name: b.name, iconUrl: b.iconUrl })),
      };
    });
  } catch (error) {
    console.error("evaluateStudentBadges failed", error);
    return { awarded: [] as AwardedBadgeInfo[] };
  }
}

/**
 * Computes the longest run of consecutive UTC days in `dateKeys`. The keys must
 * be in `YYYY-MM-DD` format; ordering does not matter. Empty array returns 0.
 */
function longestConsecutiveRun(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0;
  const set = new Set(dateKeys);
  let longest = 0;
  for (const key of set) {
    const prev = shiftDateKey(key, -1);
    if (set.has(prev)) continue;
    let streak = 1;
    let cursor = key;
    while (true) {
      const next = shiftDateKey(cursor, 1);
      if (!set.has(next)) break;
      streak++;
      cursor = next;
    }
    if (streak > longest) longest = streak;
  }
  return longest;
}

async function loadStudentStats(studentId: string): Promise<StudentStats> {
  const [
    enrollments,
    completedLessons,
    aiQuizAttempts,
    sectionQuizAttempts,
    perfectAi,
    perfectSection,
    visitDateRows,
    aiAttemptScoreRows,
    completedMentorMeetings,
  ] = await Promise.all([
    db.enrollment.count({ where: { studentId } }),
    db.lessonProgress.count({ where: { studentId, completed: true } }),
    db.aIQuizAttempt.count({ where: { studentId } }),
    db.sectionQuizAttempt.count({ where: { studentId } }),
    db.aIQuizAttempt.count({ where: { studentId, score: { gte: 100 } } }),
    db.sectionQuizAttempt.count({ where: { studentId, score: { gte: 100 } } }),
    db.courseVisit.findMany({
      where: { studentId },
      select: { dateKey: true },
      distinct: ["dateKey"],
      orderBy: { dateKey: "desc" },
      take: 365,
    }),
    db.aIQuizAttempt.findMany({
      where: { studentId, score: { not: null } },
      select: { score: true },
    }),
    db.meeting.count({
      where: { studentId, status: MeetingStatus.COMPLETED },
    }),
  ]);

  const longestCourseStreakDays = longestConsecutiveRun(
    visitDateRows.map((r) => r.dateKey),
  );

  const aiQuizScores = aiAttemptScoreRows
    .map((r) => (typeof r.score === "number" ? r.score : null))
    .filter((s): s is number => s !== null);

  return {
    enrollments,
    completedLessons,
    aiQuizAttempts,
    sectionQuizAttempts,
    perfectQuizzes: perfectAi + perfectSection,
    longestCourseStreakDays,
    aiQuizScores,
    completedMentorMeetings,
  };
}

export const __test__ = { longestConsecutiveRun };
