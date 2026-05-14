/**
 * Single source of truth for badge rule definitions used by both the admin
 * UI (NewBadgeDialog, BadgeRulesReference, /admin/badges page) and the
 * server action that maps a numeric `threshold` into the JSON `ruleConfig`.
 */

export type BadgeRuleDefinition = {
  value: string;
  label: string;
  description: string;
  configKey:
    | "minCourses"
    | "minLessons"
    | "minAttempts"
    | "minQuizzes"
    | "minPerfect"
    | "minStreakDays"
    | "minScore"
    | "minMeetings"
    | "minWishlist"
    | "minForumPosts"
    | "minReviews"
    | "minSubmissions"
    | "minCompletedCourses"
    | "minLessonNotes";
  thresholdLabel: string;
  defaultThreshold: number;
  example: string;
};

export const BADGE_RULE_DEFINITIONS: readonly BadgeRuleDefinition[] = [
  {
    value: "first_enrollment",
    label: "First enrollment (trophy)",
    description: "Awards the first time a student enrolls in any course.",
    configKey: "minCourses",
    thresholdLabel: "Courses required",
    defaultThreshold: 1,
    example: '{ "minCourses": 1 }',
  },
  {
    value: "course_count",
    label: "Course count",
    description: "Awards once a student is enrolled in at least N courses.",
    configKey: "minCourses",
    thresholdLabel: "Minimum courses",
    defaultThreshold: 3,
    example: '{ "minCourses": 5 }',
  },
  {
    value: "lessons_completed_count",
    label: "Lessons completed",
    description: "Awards after a student marks at least N lessons complete.",
    configKey: "minLessons",
    thresholdLabel: "Minimum lessons",
    defaultThreshold: 5,
    example: '{ "minLessons": 10 }',
  },
  {
    value: "ai_quiz_attempts",
    label: "AI quiz attempts",
    description:
      "Awards when a student starts at least N AI-generated quizzes.",
    configKey: "minAttempts",
    thresholdLabel: "Minimum attempts",
    defaultThreshold: 1,
    example: '{ "minAttempts": 1 }',
  },
  {
    value: "section_quiz_attempts",
    label: "Section quiz attempts",
    description:
      "Awards once a student submits at least N regular (mentor-authored) section quizzes.",
    configKey: "minAttempts",
    thresholdLabel: "Minimum submissions",
    defaultThreshold: 1,
    example: '{ "minAttempts": 1 }',
  },
  {
    value: "ai_quizzes_generated",
    label: "AI quizzes generated",
    description:
      "Awards when a student has generated at least N AI quizzes (covers 'more than 2 AI quizzes').",
    configKey: "minQuizzes",
    thresholdLabel: "Minimum quizzes",
    defaultThreshold: 3,
    example: '{ "minQuizzes": 3 }',
  },
  {
    value: "perfect_quiz_score",
    label: "Perfect quiz score",
    description:
      "Awards when a student scores 100% on at least N quizzes (counts both AI and section quizzes).",
    configKey: "minPerfect",
    thresholdLabel: "Minimum perfect quizzes",
    defaultThreshold: 1,
    example: '{ "minPerfect": 1 }',
  },
  {
    value: "course_streak_days",
    label: "Course streak (days in a row)",
    description:
      "Awards when a student opens any of their courses on N consecutive UTC days.",
    configKey: "minStreakDays",
    thresholdLabel: "Consecutive days",
    defaultThreshold: 3,
    example: '{ "minStreakDays": 3 }',
  },
  {
    value: "ai_quiz_min_score",
    label: "AI quiz score threshold",
    description:
      "Awards when a student scores at least N% on an AI quiz at least M times. Defaults to 50% on 1 attempt.",
    configKey: "minScore",
    thresholdLabel: "Minimum AI quiz score (%)",
    defaultThreshold: 50,
    example: '{ "minScore": 50, "minQuizzes": 1 }',
  },
  {
    value: "mentor_meetings_completed",
    label: "Mentor meetings completed",
    description:
      "Awards once a student has at least N successfully completed mentor meetings.",
    configKey: "minMeetings",
    thresholdLabel: "Minimum completed meetings",
    defaultThreshold: 1,
    example: '{ "minMeetings": 1 }',
  },
  {
    value: "wishlist_courses_saved",
    label: "Wishlist courses",
    description:
      "Awards when a student has at least N distinct published courses on their wishlist.",
    configKey: "minWishlist",
    thresholdLabel: "Minimum wishlisted courses",
    defaultThreshold: 1,
    example: '{ "minWishlist": 1 }',
  },
  {
    value: "forum_posts_count",
    label: "Course forum posts",
    description:
      "Awards after a student publishes at least N posts in course forums.",
    configKey: "minForumPosts",
    thresholdLabel: "Minimum forum posts",
    defaultThreshold: 1,
    example: '{ "minForumPosts": 5 }',
  },
  {
    value: "course_reviews_count",
    label: "Course reviews written",
    description:
      "Awards when a student has submitted at least N course ratings/reviews.",
    configKey: "minReviews",
    thresholdLabel: "Minimum reviews",
    defaultThreshold: 1,
    example: '{ "minReviews": 1 }',
  },
  {
    value: "assignment_submissions_count",
    label: "Assignment submissions",
    description:
      "Awards when a student has at least N submitted assignments (any course).",
    configKey: "minSubmissions",
    thresholdLabel: "Minimum submissions",
    defaultThreshold: 1,
    example: '{ "minSubmissions": 3 }',
  },
  {
    value: "courses_completed_count",
    label: "Courses fully completed",
    description:
      "Awards when a student has fully completed at least N enrollments.",
    configKey: "minCompletedCourses",
    thresholdLabel: "Minimum completed courses",
    defaultThreshold: 1,
    example: '{ "minCompletedCourses": 1 }',
  },
  {
    value: "lesson_notes_count",
    label: "Lesson notes created",
    description:
      "Awards when a student creates at least N lesson notes across their courses.",
    configKey: "minLessonNotes",
    thresholdLabel: "Minimum lesson notes",
    defaultThreshold: 1,
    example: '{ "minLessonNotes": 5 }',
  },
] as const;

export const BADGE_RULE_VALUES = BADGE_RULE_DEFINITIONS.map((r) => r.value) as [
  string,
  ...string[],
];

export function findRuleDefinition(
  ruleType: string,
): BadgeRuleDefinition | undefined {
  return BADGE_RULE_DEFINITIONS.find((r) => r.value === ruleType);
}

/**
 * Render a rule into a human-readable sentence for badge cards.
 */
export function describeRuleConfig(
  ruleType: string,
  ruleConfig: unknown,
): string {
  const def = findRuleDefinition(ruleType);
  const cfg =
    ruleConfig && typeof ruleConfig === "object"
      ? (ruleConfig as Record<string, unknown>)
      : {};
  const num = (k: string, fallback = 1) => {
    const v = cfg[k];
    return typeof v === "number" && Number.isFinite(v) ? v : fallback;
  };

  switch (ruleType) {
    case "first_enrollment":
      return "Awarded on first enrollment.";
    case "course_count":
      return `Enroll in ${num("minCourses")} course(s).`;
    case "lessons_completed_count":
      return `Complete ${num("minLessons")} lesson(s).`;
    case "ai_quiz_attempts":
      return `Try the AI quiz ${num("minAttempts")} time(s).`;
    case "section_quiz_attempts":
      return `Submit ${num("minAttempts")} section quiz attempt(s).`;
    case "ai_quizzes_generated":
      return `Generate ${num("minQuizzes")} AI quiz(zes).`;
    case "perfect_quiz_score":
      return `Score 100% on ${num("minPerfect")} quiz(zes).`;
    case "course_streak_days":
      return `Visit a course on ${num("minStreakDays", 3)} consecutive day(s).`;
    case "ai_quiz_min_score": {
      const minScore = num("minScore", 50);
      const minQuizzes = num("minQuizzes", 1);
      return `Score at least ${minScore}% on ${minQuizzes} AI quiz(zes).`;
    }
    case "mentor_meetings_completed":
      return `Complete ${num("minMeetings", 1)} mentor meeting(s).`;
    case "wishlist_courses_saved":
      return `Save ${num("minWishlist", 1)} course(s) to your wishlist.`;
    case "forum_posts_count":
      return `Post ${num("minForumPosts", 1)} time(s) in course forums.`;
    case "course_reviews_count":
      return `Write ${num("minReviews", 1)} course review(s).`;
    case "assignment_submissions_count":
      return `Submit ${num("minSubmissions", 1)} assignment(s).`;
    case "courses_completed_count":
      return `Fully complete ${num("minCompletedCourses", 1)} course(s).`;
    case "lesson_notes_count":
      return `Create ${num("minLessonNotes", 1)} lesson note(s).`;
    default:
      return def?.label ?? ruleType;
  }
}
