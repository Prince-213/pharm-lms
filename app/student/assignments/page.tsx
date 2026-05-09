import { ClipboardList, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssignmentSubmitForm } from "@/components/student/assignment-submit-form";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
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

  const rows = await Promise.all(
    assignments.map(async (a) => {
      const submission = a.submissions[0];
      const handoutHref = a.instructionsFileUrl
        ? await resolveMediaUrl(a.instructionsFileUrl)
        : null;
      const submissionFileHref = submission?.attachmentUrl
        ? await resolveMediaUrl(submission.attachmentUrl)
        : null;
      return { assignment: a, submission, handoutHref, submissionFileHref };
    }),
  );

  return (
    <div className="space-y-6 text-[var(--foreground)]">
   
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tasks from your enrolled courses. Submit written work or attach a
          file.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <ClipboardList
            className="h-10 w-10 text-[var(--border)]"
            strokeWidth={1.25}
          />
          <p className="mt-4 text-sm font-semibold">No assignments yet</p>
          <p className="mt-2 max-w-sm text-xs text-[var(--muted)]">
            When your mentor publishes an assignment in a course you&apos;re
            enrolled in, it will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map(
            ({
              assignment: a,
              submission,
              handoutHref,
              submissionFileHref,
            }) => {
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

                  {(a.instructionsFileUrl || a.instructionsLinkUrl) && (
                    <div className="mt-3 flex flex-wrap gap-2 rounded border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-2 text-xs">
                      <span className="font-bold uppercase tracking-wide text-[var(--muted)]">
                        Materials
                      </span>
                      {handoutHref ? (
                        <a
                          href={handoutHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Download handout
                        </a>
                      ) : null}
                      {a.instructionsLinkUrl ? (
                        <a
                          href={a.instructionsLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {a.instructionsLinkLabel ?? "Open link"}
                        </a>
                      ) : null}
                    </div>
                  )}

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

                  {submissionFileHref ? (
                    <div className="mt-3">
                      <a
                        href={submissionFileHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[var(--primary)] hover:underline"
                      >
                        Your submitted file
                      </a>
                    </div>
                  ) : null}

                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                      {submission ? "Update your submission" : "Your submission"}
                    </p>
                    <AssignmentSubmitForm
                      assignmentId={a.id}
                      initialContent={submission?.content ?? ""}
                      initialAttachmentUrl={submission?.attachmentUrl ?? null}
                      closed={closed}
                    />
                  </div>
                </li>
              );
            },
          )}
        </ul>
      )}
    </div>
  );
}
