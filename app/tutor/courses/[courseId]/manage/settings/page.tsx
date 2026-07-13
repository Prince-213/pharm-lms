import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CoursePurchaseStatus, UserRole } from "@/generated/prisma/enums";
import { CourseSettingsDangerZone } from "@/components/mentor/course-settings-danger-zone";
import { canTutorDeleteCourse } from "@/lib/courses/tutor-delete-course-policy";
import { db } from "@/lib/db";
import { courseStatusLabel } from "@/lib/mentor-course-auth";

export default async function MentorCourseSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { courseId } = await params;
  const { error } = await searchParams;

  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    redirect("/tutor/login");
  }

  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      _count: {
        select: {
          purchases: {
            where: { status: CoursePurchaseStatus.SUCCESS },
          },
        },
      },
    },
  });
  if (!course) {
    redirect("/tutor/courses");
  }

  const hasSuccessfulPurchases = course._count.purchases > 0;
  const canDelete = canTutorDeleteCourse(
    course.status,
    hasSuccessfulPurchases,
  );

  return (
    <section className="mx-auto max-w-[960px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Course settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.title} · {courseStatusLabel(course.status)} · Last updated{" "}
          {course.updatedAt.toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 px-6 py-5">
        {error === "locked-status" ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Only draft or rejected courses can be deleted.
          </p>
        ) : null}
        {error === "has-sales" ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Courses with successful purchases cannot be deleted. Contact an administrator.
          </p>
        ) : null}
        {error === "confirm-title" ? (
          <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
            Confirmation failed. Type the exact course title before deleting.
          </p>
        ) : null}

        <CourseSettingsDangerZone
          courseId={course.id}
          courseTitle={course.title}
          status={course.status}
          canDelete={canDelete}
          hasSuccessfulPurchases={hasSuccessfulPurchases}
        />
      </div>
    </section>
  );
}
