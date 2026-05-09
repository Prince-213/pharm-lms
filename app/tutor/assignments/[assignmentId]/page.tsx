import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssignmentStatusToggle } from "@/components/mentor/assignment-status-toggle";
import { GradeSubmissionForm } from "@/components/mentor/grade-submission-form";
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

  const submissionRows = await Promise.all(
    assignment.submissions.map(async (s) => ({
      submission: s,
      fileHref: s.attachmentUrl
        ? await resolveMediaUrl(s.attachmentUrl)
        : null,
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/tutor/assignments"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#6a6f73] hover:text-[#1c1d1f]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All assignments
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#1c1d1f]">
              {assignment.title}
            </h1>
            <p className="mt-1 text-sm text-[#6a6f73]">
              <Link
                href={`/tutor/courses/${assignment.course.id}/manage/curriculum`}
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                {assignment.course.title}
              </Link>
              {" · "}
              {assignment.dueDate
                ? `Due ${assignment.dueDate.toLocaleString()}`
                : "No due date"}
              {" · "}
              {assignment.submissions.length} submission
              {assignment.submissions.length === 1 ? "" : "s"}
            </p>
          </div>
          <AssignmentStatusToggle
            id={assignment.id}
            status={assignment.status}
          />
        </div>
      </div>

      <section className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#6a6f73]">
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
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1c1d1f]">
          {assignment.description}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#6a6f73]">
          Submissions
        </h2>
        {submissionRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e3e5e8] bg-white p-10 text-center text-sm text-[#6a6f73]">
            No submissions yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {submissionRows.map(({ submission: s, fileHref }) => (
              <li
                key={s.id}
                className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1c1d1f]">
                      {s.student.fullName}
                    </p>
                    <p className="text-xs text-[#6a6f73]">
                      {s.student.email}
                      {s.submittedAt
                        ? ` · Submitted ${s.submittedAt.toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                    {s.status.toLowerCase()}
                    {s.grade !== null && s.grade !== undefined
                      ? ` · ${s.grade}/100`
                      : ""}
                  </span>
                </div>
                {fileHref ? (
                  <p className="mt-2">
                    <a
                      href={fileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[var(--primary)] hover:underline"
                    >
                      Download submitted file
                    </a>
                  </p>
                ) : null}
                {s.content ? (
                  <p className="mt-3 whitespace-pre-wrap rounded border border-[#ececec] bg-[#fafbfb] p-3 text-sm leading-relaxed">
                    {s.content}
                  </p>
                ) : null}
                <div className="mt-4 border-t border-[#ececec] pt-4">
                  <GradeSubmissionForm
                    submissionId={s.id}
                    initialGrade={s.grade ?? undefined}
                    initialFeedback={s.feedback ?? ""}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
