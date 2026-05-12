import { redirect } from "next/navigation";
import { deleteDraftCourseAction } from "@/app/tutor/courses/[courseId]/manage/settings/actions";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
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
    select: { id: true, title: true, status: true, updatedAt: true },
  });
  if (!course) {
    redirect("/tutor/courses");
  }

  const canDeleteDraft = course.status === CourseStatus.DRAFT;

  return (
    <section className="mx-auto max-w-[960px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Course settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {course.title} · {courseStatusLabel(course.status)} · Last updated{" "}
          {course.updatedAt.toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 px-6 py-5">
        {error === "only-draft" ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Only draft courses can be deleted by tutors at this time.
          </p>
        ) : null}
        {error === "confirm-title" ? (
          <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
            Confirmation failed. Type the exact course title before deleting.
          </p>
        ) : null}

        <div className="border border-[#e5e7eb] bg-[#f8fafc] p-4">
          <h2 className="text-sm font-semibold text-[#0f172a]">Danger zone</h2>
          <p className="mt-1 text-xs text-[#475569]">
            Deleting a draft course permanently removes its sections, lessons,
            resources, and related records. This action cannot be undone.
          </p>

          {canDeleteDraft ? (
            <form
              action={deleteDraftCourseAction}
              className="mt-4 max-w-[520px] space-y-3"
            >
              <input type="hidden" name="courseId" value={course.id} />
              <label className="block text-xs font-medium text-[var(--foreground)]">
                Type the course title to confirm deletion:
                <input
                  name="confirmText"
                  className="mt-1 h-10 w-full border border-[var(--border)] px-3 text-sm"
                  placeholder={course.title}
                  required
                />
              </label>
              <button
                type="submit"
                className="rounded bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete draft course
              </button>
            </form>
          ) : (
            <p className="mt-3 text-xs text-[var(--muted)]">
              This course is <strong>{courseStatusLabel(course.status)}</strong>
              . Tutor deletion is currently limited to draft courses only.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
