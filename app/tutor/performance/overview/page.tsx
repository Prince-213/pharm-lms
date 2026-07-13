import {
  ArrowUpRight,
  GraduationCap,
  MessageSquare,
  PlayCircle,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { MentorEnrollmentChart } from "@/components/mentor/performance/mentor-enrollment-chart";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";
import { CoursePurchaseStatus, CourseStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { getTutorRevenueSummary } from "@/lib/payments/tutor-revenue";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export default async function PerformanceOverviewPage() {
  const session = await auth();
  const mentorId = session?.user?.id;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const revenueSince = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const [
    courses,
    totalEnrollments,
    distinctLearners,
    publishedCourses,
    completedLessons,
    activeLearners,
    enrollmentTrendRaw,
    unreadReviewAlerts,
    revenueHalfYear,
    purchaseCount,
  ] = mentorId
    ? await Promise.all([
        db.course.findMany({
          where: { mentorId },
          orderBy: { updatedAt: "desc" },
          take: 6,
          select: { id: true, title: true },
        }),
        db.enrollment.count({ where: { course: { mentorId } } }),
        db.enrollment
          .findMany({
            where: { course: { mentorId } },
            select: { studentId: true },
            distinct: ["studentId"],
          })
          .then((rows) => rows.length),
        db.course.count({
          where: { mentorId, status: CourseStatus.PUBLISHED },
        }),
        db.lessonProgress.count({
          where: {
            completed: true,
            lesson: { section: { course: { mentorId } } },
          },
        }),
        db.lessonProgress
          .findMany({
            where: {
              completed: true,
              completedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
              lesson: { section: { course: { mentorId } } },
            },
            select: { studentId: true },
            distinct: ["studentId"],
          })
          .then((rows) => rows.length),
        db.enrollment.findMany({
          where: {
            course: { mentorId },
            enrolledAt: { gte: sixMonthsAgo },
          },
          select: { enrolledAt: true },
        }),
        db.notification.count({
          where: {
            userId: mentorId,
            kind: "COURSE_REVIEW_RECEIVED",
            readAt: null,
          },
        }),
        getTutorRevenueSummary(mentorId, revenueSince),
        db.coursePurchase.count({
          where: {
            mentorId,
            status: CoursePurchaseStatus.SUCCESS,
          },
        }),
      ])
    : [[], 0, 0, 0, 0, 0, [], 0, { grossMinor: 0, netMinor: 0, purchaseCount: 0 }, 0];

  // ── Enrollment trend: 6-month monthly buckets ──────────────────────────────
  const now = new Date();
  type MonthBucket = { x: string; y: number; key: string };
  const enrollmentBuckets: MonthBucket[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      x: MONTH_SHORT[d.getMonth()] as string,
      y: 0,
      key: `${d.getFullYear()}-${d.getMonth()}`,
    };
  });
  for (const e of enrollmentTrendRaw) {
    const k = `${e.enrolledAt.getFullYear()}-${e.enrolledAt.getMonth()}`;
    const bucket = enrollmentBuckets.find((b) => b.key === k);
    if (bucket) bucket.y++;
  }
  const mentorEnrollmentData = enrollmentBuckets.map(({ x, y }) => ({ x, y }));
  const hasEnrollmentData = mentorEnrollmentData.some((d) => d.y > 0);

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10">
      <PerformanceToolbar
        title="Performance Overview"
        subtitle="Insights across your pharmacy academy courses."
        dateRangeLabel="Last 6 months"
      />

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 2xl:gap-7.5">
        <AdminStatCard
          label="Enrollments"
          value={totalEnrollments}
          icon={TrendingUp}
          hint={`${(distinctLearners as number).toLocaleString()} unique learners`}
        />
        <AdminStatCard
          label="Active learners"
          value={activeLearners as number}
          icon={Users}
          hint="Active in last 30 days"
        />
        <AdminStatCard
          label="Lessons Done"
          value={completedLessons as number}
          icon={GraduationCap}
          hint="By all your students"
        />
        <AdminStatCard
          label="Published"
          value={publishedCourses as number}
          icon={PlayCircle}
          hint="Live in catalog"
        />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* Enrollment trend chart */}
        <AdminPanel
          title="Enrollment Trend"
          description="New learners joining your courses"
          className="col-span-12 xl:col-span-8"
        >
          {hasEnrollmentData ? (
            <MentorEnrollmentChart data={mentorEnrollmentData} />
          ) : (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No enrollment data for the last 6 months.
              </p>
            </div>
          )}
        </AdminPanel>

        {/* Quick links / Revenue teaser */}
        <AdminPanel
          title="Academy Tools"
          description="Manage your teachings"
          className="col-span-12 xl:col-span-4"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Course revenue (6 mo.)
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                {formatMinorUnitsToCurrency(
                  (revenueHalfYear as { netMinor: number }).netMinor,
                  "NGN",
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Net to you after fees · {(purchaseCount as number).toLocaleString()}{" "}
                lifetime sales
              </p>
            </div>

            <nav className="space-y-2">
              <Link
                href="/tutor/courses/new"
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium transition-all hover:border-[var(--primary)]/40 hover:shadow-sm"
              >
                Create New Course
                <ArrowUpRight className="h-4 w-4 text-[var(--primary)]" />
              </Link>
              <Link
                href="/tutor/communication"
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium transition-all hover:border-[var(--primary)]/40 hover:shadow-sm"
              >
                Messages
                <MessageSquare className="h-4 w-4 text-[var(--primary)]" />
              </Link>
              <Link
                href="/tutor/performance/reviews"
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium transition-all hover:border-[var(--primary)]/40 hover:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  Reviews
                  {(unreadReviewAlerts as number) > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                      {unreadReviewAlerts as number} new
                    </span>
                  ) : null}
                </span>
                <Star className="h-4 w-4 text-[var(--primary)]" />
              </Link>
            </nav>
          </div>
        </AdminPanel>
      </div>

      {/* Recent courses */}
      {(courses as { id: string; title: string }[]).length > 0 && (
        <AdminPanel
          title="Course Studio"
          description="Your recently updated courses"
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(courses as { id: string; title: string }[]).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/tutor/courses/${c.id}/manage/curriculum`}
                  className="flex h-full flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 transition-all hover:border-[var(--primary)]/40 hover:bg-white hover:shadow-md"
                >
                  <p className="font-bold text-[var(--foreground)]">
                    {c.title}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[var(--primary)]">
                    Edit Curriculum
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}
    </div>
  );
}
