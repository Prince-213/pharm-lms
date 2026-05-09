import { Users } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";
import { db } from "@/lib/db";

export default async function PerformanceStudentsPage() {
  const session = await auth();
  const mentorId = session?.user?.id;

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fortnightAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    newThisMonth,
    totalLearners,
    activeLearners,
    completedAtLeastOne,
    topLearners,
  ] = mentorId
    ? await Promise.all([
        db.enrollment
          .findMany({
            where: {
              course: { mentorId },
              enrolledAt: { gte: monthAgo },
            },
            select: { studentId: true },
            distinct: ["studentId"],
          })
          .then((r) => r.length),
        db.enrollment
          .findMany({
            where: { course: { mentorId } },
            select: { studentId: true },
            distinct: ["studentId"],
          })
          .then((r) => r.length),
        db.lessonProgress
          .findMany({
            where: {
              completed: true,
              completedAt: { gte: fortnightAgo },
              lesson: { section: { course: { mentorId } } },
            },
            select: { studentId: true },
            distinct: ["studentId"],
          })
          .then((r) => r.length),
        db.lessonProgress
          .findMany({
            where: {
              completed: true,
              lesson: { section: { course: { mentorId } } },
            },
            select: { studentId: true },
            distinct: ["studentId"],
          })
          .then((r) => r.length),
        db.lessonProgress.groupBy({
          by: ["studentId"],
          where: {
            completed: true,
            lesson: { section: { course: { mentorId } } },
          },
          _count: { _all: true },
          orderBy: { _count: { studentId: "desc" } },
          take: 5,
        }),
      ])
    : [
        0,
        0,
        0,
        0,
        [] as Array<{ studentId: string; _count: { _all: number } }>,
      ];

  const idleLearners = Math.max(totalLearners - activeLearners, 0);

  const topStudents = topLearners.length
    ? await db.user.findMany({
        where: { id: { in: topLearners.map((s) => s.studentId) } },
        select: { id: true, fullName: true, email: true },
      })
    : [];
  const topStudentMap = new Map(topStudents.map((u) => [u.id, u]));

  const cohorts = [
    {
      label: "New this month",
      value: newThisMonth.toLocaleString(),
      tone: "bg-emerald-50 text-emerald-900 ring-emerald-100",
    },
    {
      label: "Active (last 14 days)",
      value: activeLearners.toLocaleString(),
      tone: "bg-sky-50 text-sky-900 ring-sky-100",
    },
    {
      label: "Idle (no recent activity)",
      value: idleLearners.toLocaleString(),
      tone: "bg-amber-50 text-amber-950 ring-amber-100",
    },
    {
      label: "Completed ≥1 lesson",
      value: completedAtLeastOne.toLocaleString(),
      tone: "bg-violet-50 text-violet-900 ring-violet-100",
    },
  ];

  return (
    <>
      <PerformanceToolbar
        title="Students"
        subtitle="Understand who is learning, who needs a nudge, and where cohorts are growing."
        dateRangeLabel="Last 12 months"
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cohorts.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl p-4 ring-1 ${c.tone} shadow-sm`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {c.label}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <PerformanceChartPanel
          emptyMessage="Enrollment velocity and retention curves will display here once richer analytics are wired."
          footerLink={{
            href: "/tutor/students",
            label: "Open student roster",
          }}
        />
        <section className="flex flex-col rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
              <Users className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1c1d1f]">
                Top engaged learners
              </h2>
              <p className="text-xs text-[#6a6f73]">
                Ranked by lessons completed across your courses.
              </p>
            </div>
          </div>
          {topLearners.length === 0 ? (
            <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[#e3e5e8] py-10 text-sm text-[#6a6f73]">
              No learner activity yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topLearners.map((s) => {
                const u = topStudentMap.get(s.studentId);
                if (!u) return null;
                return (
                  <li
                    key={s.studentId}
                    className="flex items-center justify-between rounded-lg border border-[#ececec] bg-[#fafbfb] px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1c1d1f]">
                        {u.fullName}
                      </p>
                      <p className="truncate text-xs text-[#6a6f73]">
                        {u.email}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-[var(--primary)]">
                      {s._count._all}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
      <section className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#1c1d1f]">
            Need an actionable list?
          </h2>
          <Link
            href="/tutor/students"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            Open the full roster →
          </Link>
        </div>
        <p className="mt-1 text-xs text-[#6a6f73]">
          Filter the roster by course to send announcements or follow up with
          idle learners.
        </p>
      </section>
    </>
  );
}
