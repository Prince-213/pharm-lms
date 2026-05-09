import { Star } from "lucide-react";
import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";

const starRows = [
  { stars: 5, pct: 0 },
  { stars: 4, pct: 0 },
  { stars: 3, pct: 0 },
  { stars: 2, pct: 0 },
  { stars: 1, pct: 0 },
];

export default function PerformanceReviewsPage() {
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
            <span className="text-4xl font-bold text-[#1c1d1f]">—</span>
            <span className="mb-1 text-sm text-[#6a6f73]">out of 5.0</span>
          </div>
          <div className="mt-4 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-6 w-6 text-amber-400/35"
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#6a6f73]">
            When students leave reviews, distribution and themes appear here.
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
        footerLink={{ href: "/mentor/communication/messages", label: "Ask students for feedback" }}
      />
      <section className="mt-8 rounded-xl border border-[#e3e5e8] bg-white shadow-sm">
        <div className="border-b border-[#ececec] px-5 py-4">
          <h2 className="text-sm font-bold text-[#1c1d1f]">Latest reviews</h2>
          <p className="text-xs text-[#6a6f73]">Newest written feedback across your courses.</p>
        </div>
        <div className="px-5 py-14 text-center text-sm text-[#6a6f73]">No reviews to show yet.</div>
      </section>
    </>
  );
}
