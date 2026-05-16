import { hash } from "bcryptjs";
import { MentorProfileStatus, UserRole } from "../generated/prisma/enums";
import { getOrCreatePlatformSettings } from "../lib/payments/platform-settings";
import { prisma } from "../lib/prisma";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@pharmlms.com";
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await hash(adminPasswordPlain, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { fullName: "System Admin", role: UserRole.ADMIN, passwordHash },
    create: {
      email: adminEmail,
      fullName: "System Admin",
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  const defaultBadges: Array<{
    name: string;
    description: string;
    ruleType: string;
    ruleConfig: Record<string, number>;
    iconUrl?: string;
  }> = [
    {
      name: "First Steps",
      description: "Enrolled in your first course.",
      ruleType: "first_enrollment",
      ruleConfig: { minCourses: 1 },
    },
    {
      name: "Course Collector",
      description: "Enroll in at least 3 courses.",
      ruleType: "course_count",
      ruleConfig: { minCourses: 3 },
    },
    {
      name: "Master Student",
      description: "Enroll in at least 5 courses.",
      ruleType: "course_count",
      ruleConfig: { minCourses: 5 },
    },
    {
      name: "Lesson Starter",
      description: "Complete your first lesson.",
      ruleType: "lessons_completed_count",
      ruleConfig: { minLessons: 1 },
    },
    {
      name: "Scholar",
      description: "Complete 5 lessons across your courses.",
      ruleType: "lessons_completed_count",
      ruleConfig: { minLessons: 5 },
    },
    {
      name: "Curious Mind",
      description: "Try the AI quiz at least once.",
      ruleType: "ai_quiz_attempts",
      ruleConfig: { minAttempts: 1 },
      iconUrl: "/badges/ai-apprentice.svg",
    },
    {
      name: "Quiz Initiate",
      description: "Submit your first section quiz.",
      ruleType: "section_quiz_attempts",
      ruleConfig: { minAttempts: 1 },
    },
    {
      name: "Perfectionist",
      description: "Score 100% on any quiz (section or AI).",
      ruleType: "perfect_quiz_score",
      ruleConfig: { minPerfect: 1 },
    },
    {
      name: "Quiz Architect",
      description: "Generate at least 3 AI quizzes from your courses.",
      ruleType: "ai_quizzes_generated",
      ruleConfig: { minQuizzes: 3 },
    },
    {
      name: "Streak Starter",
      description: "Open one of your courses on three days in a row.",
      ruleType: "course_streak_days",
      ruleConfig: { minStreakDays: 3 },
      iconUrl: "/badges/streak-starter.svg",
    },
    {
      name: "Bright Spark",
      description: "Score more than 50% on an AI quiz.",
      ruleType: "ai_quiz_min_score",
      ruleConfig: { minScore: 50, minQuizzes: 1 },
      iconUrl: "/badges/bright-spark.svg",
    },
    {
      name: "Mentor Match",
      description: "Complete your first successful mentor meeting.",
      ruleType: "mentor_meetings_completed",
      ruleConfig: { minMeetings: 1 },
      iconUrl: "/badges/mentor-match.svg",
    },
    {
      name: "Bookmarker",
      description: "Save your first course to the wishlist.",
      ruleType: "wishlist_courses_saved",
      ruleConfig: { minWishlist: 1 },
    },
    {
      name: "Shelf Collector",
      description: "Save at least 5 courses to your wishlist.",
      ruleType: "wishlist_courses_saved",
      ruleConfig: { minWishlist: 5 },
    },
    {
      name: "Forum Voice",
      description: "Post your first message in a course forum.",
      ruleType: "forum_posts_count",
      ruleConfig: { minForumPosts: 1 },
    },
    {
      name: "Community Regular",
      description: "Publish at least 10 posts across course forums.",
      ruleType: "forum_posts_count",
      ruleConfig: { minForumPosts: 10 },
    },
    {
      name: "Star Reviewer",
      description: "Leave your first rating and review on a course.",
      ruleType: "course_reviews_count",
      ruleConfig: { minReviews: 1 },
    },
    {
      name: "Homework Hand-in",
      description: "Submit your first assignment.",
      ruleType: "assignment_submissions_count",
      ruleConfig: { minSubmissions: 1 },
    },
    {
      name: "Assignment Grinder",
      description: "Submit at least 5 assignments across your courses.",
      ruleType: "assignment_submissions_count",
      ruleConfig: { minSubmissions: 5 },
    },
    {
      name: "Finisher",
      description: "Fully complete your first course.",
      ruleType: "courses_completed_count",
      ruleConfig: { minCompletedCourses: 1 },
    },
    {
      name: "Program Graduate",
      description: "Fully complete at least 3 courses.",
      ruleType: "courses_completed_count",
      ruleConfig: { minCompletedCourses: 3 },
    },
    {
      name: "Note Taker",
      description: "Create your first lesson note.",
      ruleType: "lesson_notes_count",
      ruleConfig: { minLessonNotes: 1 },
    },
    {
      name: "Deep Notes",
      description: "Create at least 10 lesson notes while you study.",
      ruleType: "lesson_notes_count",
      ruleConfig: { minLessonNotes: 10 },
    },
  ];

  for (const b of defaultBadges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: {
        description: b.description,
        ruleType: b.ruleType,
        ruleConfig: b.ruleConfig,
        iconUrl: b.iconUrl ?? null,
      },
      create: {
        name: b.name,
        description: b.description,
        ruleType: b.ruleType,
        ruleConfig: b.ruleConfig,
        iconUrl: b.iconUrl ?? null,
        createdById: admin.id,
      },
    });
  }

  const tutorEmail = process.env.SEED_TUTOR_EMAIL ?? "tutor@pharmlms.com";
  const tutorPasswordPlain = process.env.SEED_TUTOR_PASSWORD ?? "ChangeMe123!";
  const mentorEmail = process.env.SEED_MENTOR_EMAIL ?? "mentor@pharmlms.com";
  const mentorPasswordPlain =
    process.env.SEED_MENTOR_PASSWORD ?? "ChangeMe123!";

  const tutorPasswordHash = await hash(tutorPasswordPlain, 10);
  const mentorPasswordHash = await hash(mentorPasswordPlain, 10);

  await prisma.user.upsert({
    where: { email: tutorEmail },
    update: {
      fullName: "Sample Tutor",
      role: UserRole.TUTOR,
      passwordHash: tutorPasswordHash,
    },
    create: {
      email: tutorEmail,
      fullName: "Sample Tutor",
      role: UserRole.TUTOR,
      passwordHash: tutorPasswordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: mentorEmail },
    update: {
      fullName: "Sample Mentor",
      role: UserRole.MENTOR,
      passwordHash: mentorPasswordHash,
      bio: "I help students plan clinical rotations, interview prep, and pharmacology study strategy.",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&h=256&fit=crop",
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      mentorReviewRequestedAt: new Date(),
      mentorReviewedAt: new Date(),
      mentorReviewNote: null,
    },
    create: {
      email: mentorEmail,
      fullName: "Sample Mentor",
      role: UserRole.MENTOR,
      passwordHash: mentorPasswordHash,
      bio: "I help students plan clinical rotations, interview prep, and pharmacology study strategy.",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&h=256&fit=crop",
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      mentorReviewRequestedAt: new Date(),
      mentorReviewedAt: new Date(),
      mentorReviewNote: null,
    },
  });

  console.log("Seed complete.");
  console.log(
    "Admin user:",
    admin.email,
    "(set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env, then re-run seed if you change them)",
  );
  console.log(
    "Change the admin password from your development secret after first login in production.",
  );

  await getOrCreatePlatformSettings();

  console.log("Platform payment settings row ensured.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
