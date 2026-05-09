import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  postCourseAnnouncementAction,
  postMentorForumMessageAction,
} from "@/app/tutor/courses/[courseId]/overview/actions";
import { UserRole } from "@/generated/prisma/enums";
import {
  COURSE_ANNOUNCEMENTS_THREAD_TITLE,
  COURSE_GENERAL_FORUM_THREAD_TITLE,
} from "@/lib/course-discussions";
import { db } from "@/lib/db";

export default async function MentorCourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    redirect("/tutor/login");
  }

  const { courseId } = await params;
  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    include: {
      sections: {
        include: { lessons: { select: { id: true } } },
      },
      enrollments: { select: { id: true } },
      forums: {
        include: {
          posts: {
            orderBy: { createdAt: "desc" },
            include: {
              author: {
                select: { fullName: true, role: true },
              },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const announcementsThread = course.forums.find((f) => f.title === COURSE_ANNOUNCEMENTS_THREAD_TITLE) ?? null;
  const forumThread = course.forums.find((f) => f.title === COURSE_GENERAL_FORUM_THREAD_TITLE) ?? null;

  const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);

  const reviewStats = await db.aIQuizAttempt.aggregate({
    where: { courseId, score: { not: null } },
    _avg: { score: true },
    _count: { id: true },
  });

  const recentReviews = await db.aIQuizAttempt.findMany({
    where: { courseId, score: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { student: { select: { fullName: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-xl border border-[#d1d7dc] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0f5238]">Tutor course workspace</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-[#1c1d1f]">{course.title}</h1>
            <p className="mt-1 text-sm text-[#6a6f73]">
              Overview, learner quiz reviews, announcements, and forum discussions in one view.
            </p>
          </div>
          <Link
            href={`/tutor/courses/${courseId}/manage/curriculum`}
            className="rounded-md border border-[#d1d7dc] px-4 py-2 text-sm font-semibold text-[#1c1d1f] hover:bg-[#f8fafb]"
          >
            Edit curriculum
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">Sections</p>
          <p className="mt-1 text-2xl font-bold text-[#1c1d1f]">{course.sections.length}</p>
        </div>
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">Lessons</p>
          <p className="mt-1 text-2xl font-bold text-[#1c1d1f]">{lessonCount}</p>
        </div>
        <div className="rounded-xl border border-[#d1d7dc] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">Enrollments</p>
          <p className="mt-1 text-2xl font-bold text-[#1c1d1f]">{course.enrollments.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#d1d7dc] bg-white">
          <div className="border-b border-[#d1d7dc] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#1c1d1f]">Overview</h2>
            <p className="text-xs text-[#6a6f73]">Course description and structure snapshot</p>
          </div>
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm leading-relaxed text-[#1c1d1f]">
              {course.description.replace(/<[^>]+>/g, " ").slice(0, 420)}
              {course.description.length > 420 ? "..." : ""}
            </p>
            <ul className="space-y-1 text-sm text-[#334155]">
              {course.sections.slice(0, 6).map((section) => (
                <li key={section.id}>
                  • {section.title} ({section.lessons.length} lessons)
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-[#d1d7dc] bg-white">
          <div className="border-b border-[#d1d7dc] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#1c1d1f]">Reviews</h2>
            <p className="text-xs text-[#6a6f73]">Learner AI quiz performance insights</p>
          </div>
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm text-[#334155]">
              Average quiz score:{" "}
              <span className="font-semibold text-[#1c1d1f]">
                {reviewStats._avg.score ? `${Math.round(reviewStats._avg.score)}%` : "N/A"}
              </span>{" "}
              · Attempts:{" "}
              <span className="font-semibold text-[#1c1d1f]">{reviewStats._count.id}</span>
            </p>
            <ul className="space-y-2">
              {recentReviews.length ? (
                recentReviews.map((review) => (
                  <li key={review.id} className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm">
                    <span className="font-medium text-[#1c1d1f]">{review.student.fullName}</span>{" "}
                    scored{" "}
                    <span className="font-semibold text-[#0f5238]">{Math.round(review.score ?? 0)}%</span>
                  </li>
                ))
              ) : (
                <li className="rounded-md border border-dashed border-[#d1d7dc] px-3 py-5 text-sm text-[#6a6f73]">
                  No quiz reviews yet.
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#d1d7dc] bg-white">
          <div className="border-b border-[#d1d7dc] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#1c1d1f]">Announcements</h2>
            <p className="text-xs text-[#6a6f73]">Post updates that students see in course description.</p>
          </div>
          <form
            action={async (fd) => {
              "use server";
              const text = String(fd.get("announcement") ?? "");
              await postCourseAnnouncementAction(courseId, text);
            }}
            className="space-y-3 px-5 py-4"
          >
            <textarea
              name="announcement"
              rows={3}
              required
              maxLength={2000}
              className="w-full rounded-md border border-[#d1d7dc] px-3 py-2 text-sm"
              placeholder="Share an announcement with learners..."
            />
            <button
              type="submit"
              className="rounded-md bg-[#0f5238] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b3f2b]"
            >
              Publish announcement
            </button>
          </form>
          <div className="space-y-2 border-t border-[#d1d7dc] px-5 py-4">
            {(announcementsThread?.posts ?? []).slice(0, 10).map((post) => (
              <div key={post.id} className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
                <p className="text-sm text-[#1c1d1f]">{post.body}</p>
                <p className="mt-1 text-[11px] text-[#64748b]">{post.createdAt.toLocaleString()}</p>
              </div>
            ))}
            {!announcementsThread?.posts.length ? (
              <p className="rounded-md border border-dashed border-[#d1d7dc] px-3 py-4 text-sm text-[#6a6f73]">
                No announcements yet.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-[#d1d7dc] bg-white">
          <div className="border-b border-[#d1d7dc] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#1c1d1f]">Forum</h2>
            <p className="text-xs text-[#6a6f73]">Discuss with enrolled students.</p>
          </div>
          <form
            action={async (fd) => {
              "use server";
              const text = String(fd.get("forumMessage") ?? "");
              await postMentorForumMessageAction(courseId, text);
            }}
            className="space-y-3 px-5 py-4"
          >
            <textarea
              name="forumMessage"
              rows={3}
              required
              maxLength={2000}
              className="w-full rounded-md border border-[#d1d7dc] px-3 py-2 text-sm"
              placeholder="Reply in forum as tutor..."
            />
            <button
              type="submit"
              className="rounded-md border border-[#d1d7dc] px-4 py-2 text-sm font-semibold text-[#1c1d1f] hover:bg-[#f8fafb]"
            >
              Send to forum
            </button>
          </form>
          <div className="space-y-2 border-t border-[#d1d7dc] px-5 py-4">
            {(forumThread?.posts ?? []).slice(0, 10).map((post) => (
              <div key={post.id} className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
                <p className="text-xs font-semibold text-[#0f172a]">
                  {post.author.fullName} · {post.author.role}
                </p>
                <p className="mt-1 text-sm text-[#1c1d1f]">{post.body}</p>
              </div>
            ))}
            {!forumThread?.posts.length ? (
              <p className="rounded-md border border-dashed border-[#d1d7dc] px-3 py-4 text-sm text-[#6a6f73]">
                No forum messages yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
