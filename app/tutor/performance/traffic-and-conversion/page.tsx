import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";

const funnel = [
  { label: "Landing views", value: "0", width: 100 },
  { label: "Curriculum expand", value: "0", width: 78 },
  { label: "Add to cart / intent", value: "0", width: 56 },
  { label: "Checkout started", value: "0", width: 40 },
  { label: "Purchase complete", value: "0", width: 24 },
];

export default function PerformanceTrafficPage() {
  return (
    <>
      <PerformanceToolbar
        title="Traffic & conversion"
        subtitle="Follow visitors from discovery to enrollment and tune your course landing experience."
        dateRangeLabel="Last 12 months"
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Visitors", value: "0" },
          { label: "Conversion rate", value: "—" },
          { label: "Bounce rate", value: "—" },
          { label: "Avg. time on landing", value: "—" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-[#e3e5e8] bg-white p-4 text-center shadow-sm sm:text-left"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
              {k.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-[#1c1d1f]">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#1c1d1f]">
            Acquisition funnel
          </h2>
          <p className="mt-1 text-xs text-[#6a6f73]">
            Relative drop-off between key steps (placeholder widths for empty
            state).
          </p>
          <ul className="mt-6 space-y-4">
            {funnel.map((step) => (
              <li key={step.label}>
                <div className="mb-1 flex justify-between text-xs font-medium text-[#1c1d1f]">
                  <span>{step.label}</span>
                  <span className="text-[#6a6f73]">{step.value}</span>
                </div>
                <div className="flex justify-center">
                  <div
                    className="h-9 rounded-md bg-gradient-to-r from-[var(--primary)]/15 to-[var(--primary)]/40 ring-1 ring-[var(--primary)]/25 transition-all"
                    style={{ width: `${step.width}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <PerformanceChartPanel
          emptyMessage="Traffic sources (search, direct, referral) will chart here."
          footerLink={{
            href: "/tutor/courses",
            label: "Improve course landing",
          }}
        />
      </div>
      <section className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#1c1d1f]">Top landing pages</h2>
        <p className="mt-1 text-xs text-[#6a6f73]">
          URLs driving the most qualified visits before enrollment.
        </p>
        <div className="mt-6 rounded-lg border border-[#ececec] bg-[#fafbfb] py-12 text-center text-sm text-[#6a6f73]">
          Connect marketing analytics to list pages and UTM campaigns.
        </div>
      </section>
    </>
  );
}
