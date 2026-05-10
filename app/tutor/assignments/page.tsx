import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  type TutorAssignmentRow,
  TutorAssignmentsWorkspace,
} from "@/components/mentor/tutor-assignments-workspace";
import { UserRole } from "@/generated/prisma/enums";
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

  const rows: TutorAssignmentRow[] = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    courseId: a.course.id,
    courseTitle: a.course.title,
    status: a.status,
    dueAtIso: a.dueDate ? a.dueDate.toISOString() : null,
    createdAtIso: a.createdAt.toISOString(),
    submissionCount: a._count.submissions,
  }));

  return (
    <TutorAssignmentsWorkspace
      courses={courses}
      rows={rows}
      unreadAlertCount={unreadAlerts}
    />
  );
}
