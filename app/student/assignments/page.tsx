import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  StudentAssignmentsCrm,
  type StudentAssignmentCrmRow,
} from "@/components/student/student-assignments-crm";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user)
    redirect("/student/login?callbackUrl=/student/assignments");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const assignments = await db.assignment.findMany({
    where: {
      status: { in: [AssignmentStatus.SENT, AssignmentStatus.CLOSED] },
      course: { enrollments: { some: { studentId: session.user.id } } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      course: {
        select: {
          id: true,
          title: true,
          mentor: { select: { fullName: true } },
        },
      },
      submissions: {
        where: { studentId: session.user.id },
        select: {
          content: true,
          attachmentUrl: true,
          status: true,
          grade: true,
          feedback: true,
          submittedAt: true,
        },
      },
    },
  });

  const rows: StudentAssignmentCrmRow[] = await Promise.all(
    assignments.map(async (a) => {
      const submission = a.submissions[0] ?? null;
      const handoutHref = a.instructionsFileUrl
        ? await resolveMediaUrl(a.instructionsFileUrl)
        : null;
      const submissionFileHref = submission?.attachmentUrl
        ? await resolveMediaUrl(submission.attachmentUrl)
        : null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        status: a.status,
        dueDateIso: a.dueDate ? a.dueDate.toISOString() : null,
        instructionsFileUrl: a.instructionsFileUrl,
        instructionsLinkUrl: a.instructionsLinkUrl,
        instructionsLinkLabel: a.instructionsLinkLabel,
        course: {
          id: a.course.id,
          title: a.course.title,
          mentorName: a.course.mentor.fullName,
        },
        submission: submission
          ? {
              content: submission.content,
              attachmentUrl: submission.attachmentUrl,
              status: submission.status,
              grade: submission.grade,
              feedback: submission.feedback,
              submittedAtIso: submission.submittedAt
                ? submission.submittedAt.toISOString()
                : null,
            }
          : null,
        handoutHref,
        submissionFileHref,
      };
    }),
  );

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tasks from your enrolled courses. Filter, expand a row, then submit or
          update your work.
        </p>
      </div>

      <StudentAssignmentsCrm rows={rows} />
    </div>
  );
}
