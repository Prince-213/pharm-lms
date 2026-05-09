import { Flame, PlayCircle, Timer } from "lucide-react";
import { MiniBars } from "@/components/mentor/performance/mini-bars";
import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";

const sampleWeek = [42, 55, 38, 62, 71, 58, 64];

export default function PerformanceEngagementPage() {
  return (
    <>
      <PerformanceToolbar
        title="Engagement"
        subtitle="See when learners show up, how long they stay, and what content pulls them back."
        dateRangeLabel="Last 12 months"
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Median session",
            value: "24m",
            sub: "Sample pacing",
            icon: Timer,
          },
          {
            label: "Lessons started",
            value: "1.2k",
            sub: "Illustrative",
            icon: PlayCircle,
          },
          {
            label: "7-day streak +",
            value: "18%",
            sub: "Of active learners",
            icon: Flame,
          },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
                {label}
              </span>
              <Icon className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
            </div>
            <p className="text-2xl font-bold text-[#1c1d1f]">{value}</p>
            <p className="mt-1 text-xs text-[#6a6f73]">{sub}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1c1d1f]">
                Weekly rhythm
              </h2>
              <p className="text-xs text-[#6a6f73]">
                Sample relative activity by weekday
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-100">
              Demo
            </span>
          </div>
          <MiniBars values={sampleWeek} />
        </section>
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm lg:col-span-3">
          <h2 className="text-sm font-bold text-[#1c1d1f]">Content hotspots</h2>
          <p className="text-xs text-[#6a6f73]">
            Lessons with the highest replay and drop-off flags.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              "Introduction — syllabus walkthrough",
              "Dosage calculations workshop",
              "Case study: community pharmacy",
            ].map((title, i) => (
              <li
                key={title}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#ececec] bg-[#fafbfb] px-3 py-3 text-sm"
              >
                <span className="font-medium text-[#1c1d1f]">{title}</span>
                <span className="shrink-0 text-xs font-semibold text-[var(--primary)]">
                  {85 - i * 7}% engaged
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-[#8b9199]">
            Demo rows for layout only; connect video analytics to replace with
            real lesson stats.
          </p>
        </section>
      </div>
      <PerformanceChartPanel
        emptyMessage="Longer-range engagement trends will render in this canvas."
        footerLink={{
          href: "/tutor/performance/overview",
          label: "Back to overview",
        }}
      />
    </>
  );
}
