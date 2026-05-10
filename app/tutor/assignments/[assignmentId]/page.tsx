import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssignmentStatusPill } from "@/components/assignments/assignment-status-badges";
import { AssignmentStatusToggle } from "@/components/mentor/assignment-status-toggle";
import {
  TutorAssignmentSubmissionsPanel,
  type TutorSubmissionRow,
} from "@/components/mentor/tutor-assignment-submissions-panel";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const { assignmentId } = await params;

  await db.notification.updateMany({
    where: {
      userId: session.user.id,
      assignmentId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, course: { mentorId: session.user.id } },
    include: {
      course: { select: { id: true, title: true } },
      submissions: {
        orderBy: { submittedAt: "desc" },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
  });
  if (!assignment) notFound();

  const handoutHref = assignment.instructionsFileUrl
    ? await resolveMediaUrl(assignment.instructionsFileUrl)
    : null;

  const submissionRows: TutorSubmissionRow[] = await Promise.all(
    assignment.submissions.map(async (s) => ({
      submissionId: s.id,
      studentName: s.student.fullName,
      email: s.student.email,
      submittedAtIso: s.submittedAt ? s.submittedAt.toISOString() : null,
      status: s.status,
      grade: s.grade,
      content: s.content,
      fileHref: s.attachmentUrl ? await resolveMediaUrl(s.attachmentUrl) : null,
      initialFeedback: s.feedback ?? "",
    })),
  );

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div>
        <Link
          href="/tutor/assignments"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All assignments
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {assignment.title}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
              <Link
                href={`/tutor/courses/${assignment.course.id}/manage/curriculum`}
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                {assignment.course.title}
              </Link>
              <span aria-hidden>·</span>
              <AssignmentStatusPill status={assignment.status} />
              <span aria-hidden>·</span>
              <span>
                {assignment.dueDate
                  ? `Due ${assignment.dueDate.toLocaleString()}`
                  : "No due date"}
              </span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                {assignment.submissions.length} submission
                {assignment.submissions.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
          <AssignmentStatusToggle
            id={assignment.id}
            status={assignment.status}
          />
        </div>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Instructions
        </h2>
        {(handoutHref || assignment.instructionsLinkUrl) && (
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {handoutHref ? (
              <a
                href={handoutHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
              >
                <FileText className="h-4 w-4" />
                Handout file
              </a>
            ) : null}
            {assignment.instructionsLinkUrl ? (
              <a
                href={assignment.instructionsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {assignment.instructionsLinkLabel ?? "Reference link"}
              </a>
            ) : null}
          </div>
        )}
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
          {assignment.description}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Submissions
        </h2>
        <TutorAssignmentSubmissionsPanel rows={submissionRows} />
      </section>
    </div>
  );
}
