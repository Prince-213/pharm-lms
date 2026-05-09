import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseCatalogDetail } from "@/components/student/course-catalog-detail";
import { db } from "@/lib/db";
import { loadCourseCatalogDetail } from "@/lib/course-catalog-detail";

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
    <div className="min-h-screen bg-[#f8faff]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary-strong)]">
              Student preview
            </span>
            <p className="truncate text-sm text-slate-600">
              How learners see this course in the catalog before enrolling.
            </p>
          </div>
          <Link
            href={`/tutor/courses/${courseId}/manage`}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Back to course editor
          </Link>
        </div>
      </header>
      <CourseCatalogDetail variant="tutorPreview" data={data} />
    </div>
  );
}
