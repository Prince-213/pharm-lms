import { MessagesSquare, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { COURSE_GENERAL_FORUM_THREAD_TITLE } from "@/lib/course-discussions";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { resolveMediaUrl } from "@/lib/media-url";
import { courseStatusLabel } from "@/lib/mentor-course-auth";
import { roleHomePath } from "@/lib/rbac";

export default async function TutorCommunicationForumsPage() {
  const session = await auth();
  if (!session?.user)
    redirect("/tutor/login?callbackUrl=/tutor/communication/forums");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const courses = await withDbRetry(() =>
    db.course.findMany({
      where: { mentorId: session.user.id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        status: true,
        updatedAt: true,
        thumbnailUrl: true,
        _count: { select: { enrollments: true } },
        forums: {
          where: { title: COURSE_GENERAL_FORUM_THREAD_TITLE },
          take: 1,
          select: {
            posts: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { createdAt: true },
            },
          },
        },
      },
      orderBy: [{ title: "asc" }, { updatedAt: "desc" }],
    }),
  );

  const rows = await Promise.all(
    courses.map(async (course) => {
      const imageSrc = await resolveMediaUrl(course.thumbnailUrl);
      const lastPostAt = course.forums[0]?.posts[0]?.createdAt ?? null;
      return { ...course, imageSrc, lastPostAt };
    }),
  );

  return (
    <div className="px-5 py-6 text-[var(--foreground)] sm:px-8">
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
          <MessagesSquare
            className="h-5 w-5 text-[var(--muted)]"
            strokeWidth={1.75}
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Course forums</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Choose a course to open its discussion. The same thread appears for
            enrolled students in the course.
          </p>
        </div>
      </div>

      {rows.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((course) => (
            <li key={course.id}>
              <Link
                href={`/tutor/communication/forums/${course.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/35 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface-muted)]">
                  {course.imageSrc ? (
                    // biome-ignore lint/performance/noImgElement: signed R2 and arbitrary external URLs
                    <img
                      src={course.imageSrc}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--surface-muted)] to-[var(--background)]">
                      <MessagesSquare
                        className="h-12 w-12 text-[var(--muted)] opacity-40"
                        strokeWidth={1.25}
                      />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--background)]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)] backdrop-blur-sm">
                    {courseStatusLabel(course.status)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-display text-base font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
                    {course.title}
                  </p>
                  {course.subtitle?.trim() ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {course.subtitle.trim()}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {course._count.enrollments} enrolled
                    </span>
                    {course.lastPostAt ? (
                      <span>
                        Last post {course.lastPostAt.toLocaleDateString()}
                      </span>
                    ) : (
                      <span>No posts yet</span>
                    )}
                  </div>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[var(--primary)] group-hover:underline">
                    Open forum
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
          You don’t have any courses yet. Create a course to use the forum.
        </p>
      )}
    </div>
  );
}
