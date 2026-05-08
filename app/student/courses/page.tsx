import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { EnrolledCourseCard } from "@/components/student/enrolled-course-card";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { roleHomePath } from "@/lib/rbac";
import { resolveMediaUrl } from "@/lib/media-url";
import { getEnrollmentProgressForStudent } from "@/lib/student-course-progress";
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
  const resolvedThumbnails = await Promise.all(enrollments.map((e) => resolveMediaUrl(e.course.thumbnailUrl)));

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      {/* <StudentSecondaryNav /> */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">My courses</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
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
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--muted)]">You have not enrolled in any courses yet.</p>
          <Link
            href="/student/browse"
            className="mt-4 inline-block text-sm font-bold text-[var(--primary)] hover:underline"
          >
            Browse catalog →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e, idx) => {
            const c = e.course;
            const live = c.status === CourseStatus.PUBLISHED;
            const p = progressByCourse.get(c.id) ?? { pct: 0, completed: 0, total: 0 };
            const hasStarted = p.completed > 0 || p.pct > 0;
            return (
              <li key={e.id} className={!live ? "opacity-80" : undefined}>
                <EnrolledCourseCard
                  courseId={c.id}
                  title={c.title}
                  mentorName={c.mentor.fullName}
                  thumbnailUrl={resolvedThumbnails[idx] ?? null}
                  priceMinorUnits={c.priceMinorUnits}
                  priceCurrency={c.priceCurrency}
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
