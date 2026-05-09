import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewAssignmentForm } from "@/components/mentor/new-assignment-form";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

const STATUS_TONE: Record<AssignmentStatus, string> = {
  [AssignmentStatus.DRAFT]: "bg-amber-100 text-amber-900",
  [AssignmentStatus.SENT]: "bg-emerald-100 text-emerald-900",
  [AssignmentStatus.CLOSED]: "bg-slate-200 text-slate-700",
};

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1c1d1f]">Assignments</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6a6f73]">
          Create assignments for your courses, manage drafts, and review
          submissions in one place.
        </p>
      </div>

      <NewAssignmentForm courses={courses} />

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#6a6f73]">
          Your assignments ({assignments.length})
        </h2>
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e3e5e8] bg-white px-6 py-14 text-center text-sm text-[#6a6f73]">
            <ClipboardList
              className="h-9 w-9 text-[#c0c4cc]"
              strokeWidth={1.25}
            />
            <p className="mt-3 font-semibold text-[#1c1d1f]">
              No assignments yet
            </p>
            <p className="mt-1">
              Use the composer above to create your first assignment.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[#e3e5e8] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/mentor/assignments/${a.id}`}
                        className="text-base font-bold text-[#1c1d1f] hover:text-[var(--primary)]"
                      >
                        {a.title}
                      </Link>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[a.status]}`}
                      >
                        {a.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6a6f73]">
                      <Link
                        href={`/mentor/courses/${a.course.id}/manage/curriculum`}
                        className="font-semibold text-[var(--primary)] hover:underline"
                      >
                        {a.course.title}
                      </Link>
                      {" · "}
                      Created {a.createdAt.toLocaleDateString()}
                      {a.dueDate ? ` · Due ${a.dueDate.toLocaleString()}` : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[#3e4143]">
                      {a.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[#6a6f73]">
                    <p className="font-bold tabular-nums text-[#1c1d1f]">
                      {a._count.submissions}
                    </p>
                    <p>submission{a._count.submissions === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
