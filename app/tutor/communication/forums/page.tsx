import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
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
        status: true,
        updatedAt: true,
      },
      orderBy: [{ title: "asc" }, { updatedAt: "desc" }],
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
            Each course has a forum on its overview. Open a course below to read
            and post in the discussion.
          </p>
        </div>
      </div>

      {courses.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
            >
              <p className="text-sm font-semibold leading-snug">
                {course.title}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {courseStatusLabel(course.status)}
                {" · "}
                Updated {course.updatedAt.toLocaleDateString()}
              </p>
              <Link
                href={`/tutor/courses/${course.id}/overview#course-forum`}
                className="mt-3 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Open forum on overview
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
