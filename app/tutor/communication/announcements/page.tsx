import { Megaphone } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseAnnouncementForm } from "@/components/mentor/course-announcement-form";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorCommunicationAnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const courses = await db.course.findMany({
    where: { mentorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div className="px-5 py-6 sm:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Announcements</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            Send the same message to every student enrolled in one of your
            courses. The message arrives in each student&apos;s inbox as a 1:1
            thread you can follow up on.
          </p>
        </div>
      </div>

      <div className="mb-10 rounded border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone
            className="h-5 w-5 text-[var(--primary)]"
            strokeWidth={1.75}
          />
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Course-wide message
          </h3>
        </div>
        {courses.length === 0 ? (
          <p className="rounded border border-dashed border-[var(--border)] bg-white p-6 text-center text-sm text-[var(--muted)]">
            Publish a course first — announcements need at least one course to
            target.
          </p>
        ) : (
          <CourseAnnouncementForm
            courses={courses.map((c) => ({
              id: c.id,
              title: c.title,
              learners: c._count.enrollments,
            }))}
          />
        )}
      </div>
    </div>
  );
}
