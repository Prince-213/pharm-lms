import Link from "next/link";
import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EnrolledCourseCard } from "@/components/student/enrolled-course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { roleHomePath } from "@/lib/rbac";
import { resolveMediaUrl } from "@/lib/media-url";
import { getEnrollmentProgressForStudent } from "@/lib/student-course-progress";
import {
  getStudentPricingContext,
  toDisplayCoursePrice,
} from "@/lib/currency/student-pricing-context";
import { db } from "@/lib/db";

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/courses");
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subtitle: true,
          status: true,
          thumbnailUrl: true,
          priceMinorUnits: true,
          priceCurrency: true,
          mentor: { select: { fullName: true } },
        },
      },
    },
  });

  const courseIds = enrollments.map((e) => e.course.id);
  const progressByCourse = await getEnrollmentProgressForStudent(session.user.id, courseIds);
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
  const resolvedThumbnails = await Promise.all(enrollments.map((e) => resolveMediaUrl(e.course.thumbnailUrl)));

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      {/* <StudentSecondaryNav /> */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Same list as{" "}
            <Link href="/student/dashboard" className="font-semibold text-[var(--primary)] hover:underline">
              My learning
            </Link>{" "}
            — every enrollment in one place.
          </p>
        </div>
        <Link href="/student/browse" className="text-sm font-bold text-[var(--primary)] hover:underline">
          + Discover more courses
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="You have not enrolled in any courses. Browse the catalog to start learning."
          actionHref="/student/browse"
          actionLabel="Browse catalog"
        />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e, idx) => {
            const c = e.course;
            const live = c.status === CourseStatus.PUBLISHED;
            const p = progressByCourse.get(c.id) ?? { pct: 0, completed: 0, total: 0 };
            const hasStarted = p.completed > 0 || p.pct > 0;
            const display = displayPricesByCourseId.get(c.id);
            return (
              <li key={e.id} className={!live ? "opacity-80" : undefined}>
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
                {!live ? (
                  <p className="mt-2 text-center text-[11px] font-medium text-amber-800">
                    This course is no longer published.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
