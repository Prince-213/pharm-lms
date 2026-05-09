<<<<<<< HEAD
=======
import { ClipboardList } from "lucide-react";
import Link from "next/link";
>>>>>>> parent of 59e8bcc (Good. the student course description is on point)
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  StudentAssignmentsCrm,
  type StudentAssignmentCrmRow,
} from "@/components/student/student-assignments-crm";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
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
          status: true,
          grade: true,
          feedback: true,
          submittedAt: true,
        },
      },
    },
  });

<<<<<<< HEAD
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

=======
>>>>>>> parent of 59e8bcc (Good. the student course description is on point)
  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
<<<<<<< HEAD
          Tasks from your enrolled courses. Filter, expand a row, then submit or
          update your work.
        </p>
      </div>

      <StudentAssignmentsCrm rows={rows} />
=======
          Tasks set by your mentors across the courses you are enrolled in.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <ClipboardList
            className="h-10 w-10 text-[var(--border)]"
            strokeWidth={1.25}
          />
          <p className="mt-4 text-sm font-semibold">No assignments yet</p>
          <p className="mt-2 max-w-sm text-xs text-[var(--muted)]">
            When a mentor publishes an assignment in one of your courses it will
            appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {assignments.map((a) => {
            const submission = a.submissions[0];
            const closed = a.status === AssignmentStatus.CLOSED;
            return (
              <li
                key={a.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold">{a.title}</h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      <Link
                        href={`/student/course/${a.course.id}`}
                        className="font-semibold text-[var(--primary)] hover:underline"
                      >
                        {a.course.title}
                      </Link>{" "}
                      · {a.course.mentor.fullName}
                      {a.dueDate ? ` · Due ${a.dueDate.toLocaleString()}` : ""}
                    </p>
                  </div>
                  {submission ? (
                    <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900">
                      {submission.status.toLowerCase()}
                      {submission.grade !== null &&
                      submission.grade !== undefined
                        ? ` · ${submission.grade}/100`
                        : ""}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                  {a.description}
                </p>

                {submission?.feedback ? (
                  <div className="mt-3 rounded border border-[var(--primary)]/30 bg-[var(--primary-soft)]/40 p-3 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                      Mentor feedback
                    </p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                      {submission.feedback}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    {submission ? "Update your submission" : "Your submission"}
                  </p>
                  <AssignmentSubmitForm
                    assignmentId={a.id}
                    initialContent={submission?.content ?? ""}
                    closed={closed}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
>>>>>>> parent of 59e8bcc (Good. the student course description is on point)
    </div>
  );
}
