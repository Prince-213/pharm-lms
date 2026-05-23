import {
  Award,
  BookOpen,
  ClipboardList,
  Heart,
  Search,
  Trophy,
} from "@/lib/icons/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardSearchInput } from "@/components/student/dashboard-search-input";
import { EnrolledCourseCard } from "@/components/student/enrolled-course-card";
import { UserRole } from "@/generated/prisma/enums";
import {
  getStudentPricingContext,
  toDisplayCoursePrice,
} from "@/lib/currency/student-pricing-context";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { getEnrollmentProgressForStudent } from "@/lib/student-course-progress";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPanel } from "@/components/admin/admin-panel";
import { StreakMetric } from "@/components/student/streak-metric";
import { getStudentStreak } from "@/lib/student/streak";

type SearchParams = {
  q?: string;
};

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/dashboard");
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const params = (await searchParams) ?? {};
  const query = (params.q ?? "").trim().slice(0, 80);

  const firstName =
    session.user.name?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "there";

  const enrollments = await db.enrollment.findMany({
    where: {
      studentId: session.user.id,
      ...(query
        ? {
            course: {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { subtitle: { contains: query, mode: "insensitive" as const } },
                {
                  mentor: {
                    fullName: { contains: query, mode: "insensitive" as const },
                  },
                },
              ],
            },
          }
        : {}),
    },
    orderBy: { enrolledAt: "desc" },
    take: 24,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subtitle: true,
          thumbnailUrl: true,
          priceMinorUnits: true,
          priceCurrency: true,
          status: true,
          mentor: { select: { fullName: true } },
        },
      },
    },
  });

  const courseIds = enrollments.map((e) => e.course.id);
  const progressByCourse = await getEnrollmentProgressForStudent(
    session.user.id,
    courseIds,
  );
  const { displayCurrency } = await getStudentPricingContext(session.user.id);
  const displayPricesByCourseId = new Map(
    await Promise.all(
      enrollments.map(async (e) => {
        const display = await toDisplayCoursePrice(
          e.course.priceMinorUnits,
          displayCurrency,
        );
        return [e.course.id, display] as const;
      }),
    ),
  );

  const resolvedThumbnails = await Promise.all(
    enrollments.map((e) => resolveMediaUrl(e.course.thumbnailUrl)),
  );

  const [enrollmentCount, completedLessons, badgesEarned, wishlistCount, streakData] =
    await Promise.all([
      db.enrollment.count({ where: { studentId: session.user.id } }),
      db.lessonProgress.count({
        where: { studentId: session.user.id, completed: true },
      }),
      db.studentBadge.count({ where: { studentId: session.user.id } }),
      db.wishlist.count({ where: { studentId: session.user.id } }),
      getStudentStreak(session.user.id),
    ]);

  return (
    <div className="space-y-8">
      {/* ─── Page header ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Resume your courses or explore new pharmacy certifications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/student/assignments"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-slate-50 hover:shadow-sm active:scale-95"
          >
            <ClipboardList className="h-4 w-4 text-[var(--primary)]" />
            Assignments
          </Link>
          <Link
            href="/student/browse"
            className="inline-flex items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--primary-strong)] active:scale-95"
          >
            Explore Courses
          </Link>
        </div>
      </div>

      {/* ─── Stat cards + streak ─── */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          <AdminStatCard
            label="Achievements"
            value={badgesEarned}
            icon={Award}
            hint="Badges earned"
            href="/student/achievements"
          />
          <AdminStatCard
            label="Wishlist"
            value={wishlistCount}
            icon={Heart}
            hint="Courses saved"
            href="/student/wishlist"
          />
          <AdminStatCard
            label="Enrolled Courses"
            value={enrollmentCount}
            icon={BookOpen}
            hint="Active learning paths"
          />
          <AdminStatCard
            label="Lessons Completed"
            value={completedLessons}
            icon={Trophy}
            hint="All-time progress"
          />
        </div>
        <StreakMetric days={streakData.days} active={streakData.activeToday} />
      </div>

      <AdminPanel
        title="My Learning"
        description="Continue where you left off"
        headerAction={<DashboardSearchInput initialQuery={query} />}
      >
        {enrollments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[var(--muted)]">
              {query
                ? `No enrolled courses match "${query}".`
                : "You have not enrolled in any courses yet."}
            </p>
            <Link
              href="/student/browse"
              className="mt-4 inline-block text-sm font-bold text-[var(--primary)] hover:underline"
            >
              Browse the catalog →
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e, idx) => {
              const c = e.course;
              const p = progressByCourse.get(c.id) ?? {
                pct: 0,
                completed: 0,
                total: 0,
              };
              const hasStarted = p.completed > 0 || p.pct > 0;
              const display = displayPricesByCourseId.get(c.id);
              return (
                <li key={e.id}>
                  <EnrolledCourseCard
                    courseId={c.id}
                    title={c.title}
                    mentorName={c.mentor.fullName}
                    thumbnailUrl={resolvedThumbnails[idx] ?? null}
                    priceMinorUnits={display?.priceMinorUnits ?? c.priceMinorUnits}
                    priceCurrency={display?.priceCurrency ?? c.priceCurrency}
                    progressPct={p.pct}
                    hasStarted={hasStarted}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
