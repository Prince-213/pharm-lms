import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseCatalogDetail } from "@/components/student/course-catalog-detail";
import { loadCourseCatalogDetail } from "@/lib/course-catalog-detail";
import { db } from "@/lib/db";

export default async function TutorCourseCatalogPreviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");

  const { courseId } = await params;

  const owned = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: { id: true },
  });
  if (!owned) notFound();

  const data = await loadCourseCatalogDetail(courseId, {
    id: session.user.id,
    role: session.user.role,
  });
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary-strong)]">
              Student preview
            </span>
            <p className="truncate text-sm text-[var(--muted)]">
              How learners see this course in the catalog before enrolling.
            </p>
          </div>
          <Link
            href={`/tutor/courses/${courseId}/manage`}
            className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--surface-muted)]"
          >
            Back to course editor
          </Link>
        </div>
      </header>
      <CourseCatalogDetail
        variant="tutorPreview"
        interaction="readonly"
        data={data}
      />
    </div>
  );
}
