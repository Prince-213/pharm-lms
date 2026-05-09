import { Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

const REVIEW_TAKE = 80;

function starDisplay(rating: number) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-[#e3e5e8]"
          }`}
          strokeWidth={i < rating ? 0 : 1}
        />
      ))}
    </span>
  );
}

export default async function PerformanceReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  await db.notification.updateMany({
    where: {
      userId: session.user.id,
      kind: "COURSE_REVIEW_RECEIVED",
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const [aggregate, grouped, reviews] = await Promise.all([
    db.courseReview.aggregate({
      where: { course: { mentorId: session.user.id } },
      _avg: { rating: true },
      _count: true,
    }),
    db.courseReview.groupBy({
      by: ["rating"],
      where: { course: { mentorId: session.user.id } },
      _count: { rating: true },
    }),
    db.courseReview.findMany({
      where: { course: { mentorId: session.user.id } },
      orderBy: { createdAt: "desc" },
      take: REVIEW_TAKE,
      include: {
        course: { select: { title: true } },
        student: { select: { fullName: true } },
      },
    }),
  ]);

  const total = aggregate._count;
  const avg = aggregate._avg.rating ?? 0;
  const avgDisplay = total > 0 ? avg.toFixed(1) : "—";

  const countByStar = new Map(grouped.map((g) => [g.rating, g._count.rating]));
  const starRows = [5, 4, 3, 2, 1].map((stars) => {
    const count = countByStar.get(stars) ?? 0;
    return {
      stars,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return (
    <>
      <PerformanceToolbar
        title="Reviews"
        subtitle="Monitor sentiment, spot course issues early, and celebrate wins."
        dateRangeLabel="Last 12 months"
      />
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e3e5e8] bg-white p-6 shadow-sm lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
            Average rating
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-bold text-[#1c1d1f]">{avgDisplay}</span>
            <span className="mb-1 text-sm text-[#6a6f73]">out of 5.0</span>
          </div>
          <div className="mt-4 flex gap-0.5 scale-110 origin-left">
            {total > 0 ? starDisplay(Math.min(5, Math.round(avg))) : (
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-amber-400/35"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ))}
              </span>
            )}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#6a6f73]">
            {total === 0
              ? "When students leave reviews, your average and distribution appear here."
              : `${total} review${total === 1 ? "" : "s"} across your courses.`}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3e5e8] bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold text-[#1c1d1f]">Rating distribution</h2>
          <ul className="mt-5 space-y-3">
            {starRows.map((row) => (
              <li key={row.stars} className="flex items-center gap-3 text-sm">
                <span className="w-14 font-medium text-[#1c1d1f]">{row.stars} stars</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ececec]">
                  <div
                    className="h-full rounded-full bg-amber-400/90"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-[#6a6f73]">{row.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <PerformanceChartPanel
        emptyMessage="Review volume over time will display in this chart."
        footerLink={{
          href: "/tutor/communication/messages",
          label: "Ask students for feedback",
        }}
      />
      <section className="mt-8 rounded-xl border border-[#e3e5e8] bg-white shadow-sm">
        <div className="border-b border-[#ececec] px-5 py-4">
          <h2 className="text-sm font-bold text-[#1c1d1f]">Latest reviews</h2>
          <p className="text-xs text-[#6a6f73]">Newest written feedback across your courses.</p>
        </div>
        {reviews.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-[#6a6f73]">
            No reviews to show yet.
          </div>
        ) : (
          <ul className="divide-y divide-[#ececec]">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#1c1d1f]">
                      {r.student.fullName}
                    </p>
                    <p className="text-xs text-[#6a6f73]">{r.course.title}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {starDisplay(r.rating)}
                    <time
                      className="text-[11px] text-[#8b9199]"
                      dateTime={r.createdAt.toISOString()}
                    >
                      {r.createdAt.toLocaleString()}
                    </time>
                  </div>
                </div>
                {r.comment ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#3d4043]">
                    {r.comment}
                  </p>
                ) : (
                  <p className="mt-2 text-xs italic text-[#8b9199]">No written comment.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-6 text-center text-xs text-[#8b9199]">
        Showing up to {REVIEW_TAKE} most recent reviews.{" "}
        <Link href="/tutor/performance/overview" className="font-semibold text-[var(--primary)] hover:underline">
          Back to overview
        </Link>
      </p>
    </>
  );
}
