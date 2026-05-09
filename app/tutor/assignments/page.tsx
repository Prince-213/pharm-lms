import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewAssignmentForm } from "@/components/mentor/new-assignment-form";
import {
  TutorAssignmentsCrm,
  type TutorAssignmentCrmRow,
} from "@/components/mentor/tutor-assignments-crm";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorAssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const courses = await db.course.findMany({
    where: { mentorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });

  const assignments = await db.assignment.findMany({
    where: { course: { mentorId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
    },
  });

  const unreadAlerts = await db.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  const rows: TutorAssignmentCrmRow[] = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    status: a.status,
    dueDateIso: a.dueDate ? a.dueDate.toISOString() : null,
    createdAtIso: a.createdAt.toISOString(),
    course: a.course,
    submissionCount: a._count.submissions,
  }));

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Create assignments, track statuses, and open any row to review
          submissions.
        </p>
      </div>

      {unreadAlerts > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <span className="font-semibold">{unreadAlerts}</span> unread{" "}
          {unreadAlerts === 1 ? "alert" : "alerts"} — open an assignment to
          review new submissions.
        </div>
      ) : null}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Create assignment
        </h2>
        <NewAssignmentForm courses={courses} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Your assignments
        </h2>
        <TutorAssignmentsCrm rows={rows} courses={courses} />
      </section>
    </div>
  );
}
