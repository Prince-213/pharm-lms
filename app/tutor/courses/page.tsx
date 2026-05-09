import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { auth } from "@/auth";
import { CourseStatus } from "@/generated/prisma/enums";
import { courseStatusLabel } from "@/lib/mentor-course-auth";
import { resolveMediaUrl } from "@/lib/media-url";
import { db } from "@/lib/db";
import { CourseCardMenu } from "@/components/mentor/course-card-menu";

function progressPercent(status: CourseStatus): number {
  switch (status) {
    case CourseStatus.PUBLISHED:
      return 100;
    case CourseStatus.APPROVED:
      return 92;
    case CourseStatus.SUBMITTED:
      return 72;
    case CourseStatus.REJECTED:
      return 48;
    case CourseStatus.DRAFT:
    default:
      return 36;
  }
}

function statusRibbon(status: CourseStatus): string {
  switch (status) {
    case CourseStatus.PUBLISHED:
      return "Live";
    case CourseStatus.SUBMITTED:
      return "In review";
    case CourseStatus.APPROVED:
      return "Approved";
    case CourseStatus.REJECTED:
      return "Needs revision";
    case CourseStatus.DRAFT:
    default:
      return "In production";
  }
}

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
        },
      })
    : [];

  const resolvedThumbnails = await Promise.all(courses.map((c) => resolveMediaUrl(c.thumbnailUrl)));

  const firstCourse = courses[0];

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

      <div className="mb-10 flex flex-col gap-6">
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6b7280]" />
            <input
              readOnly
              placeholder="Search your courses"
              className="w-full cursor-not-allowed rounded-md border-0 bg-[#e1e3e4] py-3.5 pl-12 pr-4 text-sm text-[#6b7280]"
            />
          </div>
          <div className="relative min-w-[140px]">
            <select
              disabled
              className="h-11 w-full cursor-not-allowed appearance-none rounded-md border-0 bg-[#e1e3e4] pl-4 pr-10 text-sm font-semibold text-[#191c1d]"
              defaultValue="newest"
            >
              <option value="newest">Newest</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">▾</span>
          </div>
        </div>
      </div>

      <section className="mb-10 flex flex-wrap gap-8 border border-[#e1e3e4] bg-white px-8 py-6 shadow-sm">
        <div className="flex size-24 shrink-0 items-center justify-center bg-[#eceeef] text-3xl text-[#64748b]">
          ?
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block bg-[#2d6a4f] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            New
          </span>
          <h2 className="mt-2 font-display text-xl font-bold text-[#191c1d]">
            Create clinical practice tests for your students
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#404943]">
            Improve student outcomes with practice-style assessments. When quiz authoring ships, you will be able to add
            mock exams alongside video and article lessons.
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

      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="border border-[#e1e3e4] bg-white p-10 text-center text-sm text-[#404943]">
            You have no courses yet. Use <strong>New Course</strong> to open the studio wizard.
          </div>
        ) : (
          <>
            {courses.map((course, idx) => {
              const pct = progressPercent(course.status);
              const thumb = resolvedThumbnails[idx];
              return (
                <article
                  key={course.id}
                  className="flex flex-col overflow-hidden border border-[#e1e3e4] bg-white shadow-sm sm:flex-row"
                >
                  <Link
                    href={`/tutor/courses/${course.id}/manage/curriculum`}
                    className="relative flex h-48 w-full shrink-0 bg-[#eceeef] sm:h-auto sm:w-64"
                  >
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-center text-xs font-semibold text-slate-600">
                        {course.title.slice(0, 40)}
                      </div>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-extrabold text-[#191c1d]">{course.title}</h2>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#404943]">
                          {statusRibbon(course.status)}
                        </p>
                        <p className="mt-2 text-xs text-[#64748b]">{courseStatusLabel(course.status)}</p>
                      </div>
                      <CourseCardMenu courseId={course.id} courseTitle={course.title} status={course.status} />
                    </div>
                    <div>
                      <div className="mb-2 flex items-end justify-between text-sm font-semibold">
                        <span className="text-[#191c1d]">Finish your course</span>
                        <span className="text-[#0f5238]">{pct}% Complete</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden bg-[#e1e3e4]">
                        <div className="h-full bg-[#2d6a4f] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <Link
                        href={`/tutor/courses/${course.id}/manage/curriculum`}
                        className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-[#0f5238] hover:underline"
                      >
                        Edit course →
                      </Link>
                      <Link
                        href={`/tutor/courses/${course.id}/overview`}
                        className="mt-2 ml-3 inline-block text-xs font-semibold uppercase tracking-wide text-[#334155] hover:underline"
                      >
                        Course overview →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center bg-[#f2f4f5] px-8 py-12 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-white shadow-sm text-2xl">
                  💡
                </div>
                <h3 className="text-lg font-semibold text-[#191c1d]">Instructor insights</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#404943]">
                  Based on catalog trends, learners engage strongly with dosage calculations and patient safety modules.
                  Consider sequencing those early in your next course.
                </p>
              </div>
              <div className="flex flex-col items-center bg-[#0f5238] px-8 py-12 text-center text-white">
                <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-[#2d6a4f] shadow-lg text-2xl">
                  ✨
                </div>
                <h3 className="text-lg font-semibold">Certification prep</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#a8e7c5]">
                  {firstCourse
                    ? `Publish "${firstCourse.title}" to unlock student enrollments and completion analytics.`
                    : "Publish a course to unlock enrollments, completion analytics, and program badges."}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
