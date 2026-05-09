import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";

export default function PerformanceRevenuePage() {
  return (
    <>
      <PerformanceToolbar
        title="Revenue"
        subtitle="Track earnings, refunds, and payout timing across your catalog."
        dateRangeLabel="Last 12 months"
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Gross revenue",
            value: "$0.00",
            sub: "Before platform fees",
          },
          {
            label: "Net to you",
            value: "$0.00",
            sub: "After fees & adjustments",
          },
          {
            label: "Avg. per learner",
            value: "$0.00",
            sub: "Trailing 30 days",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#1c1d1f]">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-[#6a6f73]">{card.sub}</p>
          </div>
        ))}
      </div>
      <PerformanceChartPanel
        emptyMessage="Revenue trends will chart here once transactions are linked."
        footerLink={{ href: "/tutor/courses", label: "Set up course pricing" }}
      />
      <section className="mt-8 overflow-hidden rounded-xl border border-[#e3e5e8] bg-white shadow-sm">
        <div className="border-b border-[#ececec] px-5 py-4">
          <h2 className="text-sm font-bold text-[#1c1d1f]">
            Payout-ready breakdown
          </h2>
          <p className="text-xs text-[#6a6f73]">
            Placeholder rows for per-course revenue.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-[#ececec] text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Units sold</th>
                <th className="px-5 py-3">Refunds</th>
                <th className="px-5 py-3 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-14 text-center text-[#6a6f73]"
                >
                  No transactions yet. Publish a priced course to populate this
                  table.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
