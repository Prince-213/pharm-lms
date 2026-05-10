import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  type StudentAssignmentRow,
  StudentAssignmentsWorkspace,
} from "@/components/student/student-assignments-workspace";
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
          id: true,
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

  const rows: StudentAssignmentRow[] = await Promise.all(
    assignments.map(async (a) => {
      const submission = a.submissions[0] ?? null;
      const handoutHref = a.instructionsFileUrl
        ? await resolveMediaUrl(a.instructionsFileUrl)
        : null;
      const submissionFileHref = submission?.attachmentUrl
        ? await resolveMediaUrl(submission.attachmentUrl)
        : null;
      return {
        assignmentId: a.id,
        title: a.title,
        courseId: a.course.id,
        courseTitle: a.course.title,
        mentorName: a.course.mentor.fullName,
        dueAtIso: a.dueDate ? a.dueDate.toISOString() : null,
        assignmentStatus: a.status,
        closed: a.status === AssignmentStatus.CLOSED,
        description: a.description,
        hasHandout: Boolean(a.instructionsFileUrl),
        handoutHref,
        instructionsLinkUrl: a.instructionsLinkUrl,
        instructionsLinkLabel: a.instructionsLinkLabel,
        submission: submission
          ? {
              status: submission.status,
              grade: submission.grade,
              feedback: submission.feedback,
              content: submission.content,
              attachmentUrl: submission.attachmentUrl,
              submissionFileHref,
            }
          : null,
      };
    }),
  );

  return <StudentAssignmentsWorkspace rows={rows} />;
}
