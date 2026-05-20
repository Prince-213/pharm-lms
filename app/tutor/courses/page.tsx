import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { TutorCoursesList } from "@/components/mentor/tutor-courses-list";
import { CoursePurchaseStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export default async function MentorCoursesPage() {
  const session = await auth();
  const courses = session?.user?.id
    ? await db.course.findMany({
        where: { mentorId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          thumbnailUrl: true,
          updatedAt: true,
          _count: {
            select: {
              purchases: {
                where: { status: CoursePurchaseStatus.SUCCESS },
              },
            },
          },
        },
      })
    : [];

  const rows = await Promise.all(
    courses.map(async (c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      thumbnailUrl: await resolveMediaUrl(c.thumbnailUrl),
      purchaseCount: c._count.purchases,
      updatedAtIso: c.updatedAt.toISOString(),
    })),
  );

  const firstCourseTitle = rows[0]?.title ?? null;

  return (
    <div className="w-full px-6 py-10 sm:px-8 lg:px-10">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#191c1d] sm:text-4xl">
          Courses
        </h1>
        <Link
          href="/tutor/courses/new/step-2"
          className="relative inline-flex items-center gap-2 bg-[#2d6a4f] px-8 py-3 text-base font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(45,106,79,0.25)] transition hover:bg-[#245a43]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Course
        </Link>
      </div>

      <section className="mb-10 flex flex-wrap gap-8 border border-[#e1e3e4] bg-white px-8 py-6 shadow-sm">
        <div className="min-w-0 flex-1">
          <span className="inline-block bg-[#2d6a4f] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            New
          </span>
          <h2 className="mt-2 font-display text-xl font-bold text-[#191c1d]">
            Create clinical practice tests for your students
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#404943]">
            Improve student outcomes with practice-style assessments. When quiz
            authoring ships, you will be able to add mock exams alongside video
            and article lessons.
          </p>
          <button
            type="button"
            className="mt-4 border-b-2 border-[rgba(15,82,56,0.25)] pb-0.5 text-sm font-semibold text-[#0f5238] opacity-70"
            disabled
          >
            Learn more
          </button>
        </div>
      </section>

      <TutorCoursesList courses={rows} firstCourseTitle={firstCourseTitle} />
    </div>
  );
}
