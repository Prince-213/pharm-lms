import Link from "next/link";
import { auth } from "@/auth";
import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";
import { UserRole } from "@/generated/prisma/enums";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { getTutorRevenueByCourse, getTutorRevenueSummary } from "@/lib/payments/tutor-revenue";
import { getTutorWalletBalances } from "@/lib/payments/tutor-wallet";
import { roleHomePath } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function PerformanceRevenuePage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) redirect(roleHomePath(session.user.role));

  const mentorId = session.user.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [allTime, trailing, byCourse, wallet] = await Promise.all([
    getTutorRevenueSummary(mentorId),
    getTutorRevenueSummary(mentorId, thirtyDaysAgo),
    getTutorRevenueByCourse(mentorId),
    getTutorWalletBalances(mentorId),
  ]);

  const feePart = allTime.grossMinor - allTime.netMinor;

  return (
    <>
      <PerformanceToolbar
        title="Revenue"
        subtitle="Track earnings from paid course sales (Paystack)."
        dateRangeLabel="Last 30 days (avg per learner)"
      />

      <div className="mb-6 rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
              Available to withdraw
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#1c1d1f]">
              {formatMinorUnitsToCurrency(wallet.availableMinor, "NGN")}
            </p>
          </div>
          <Link
            href="/tutor/payouts#request"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)]"
          >
            Request withdrawal
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Gross revenue",
            value: formatMinorUnitsToCurrency(allTime.grossMinor, "NGN"),
            sub: "All-time student payments (before platform fee)",
          },
          {
            label: "Net to you",
            value: formatMinorUnitsToCurrency(allTime.netMinor, "NGN"),
            sub: "After platform fee",
          },
          {
            label: "Avg. per sale (30d)",
            value:
              trailing.purchaseCount > 0
                ? formatMinorUnitsToCurrency(
                    Math.floor(trailing.netMinor / trailing.purchaseCount),
                    "NGN",
                  )
                : "—",
            sub: `${trailing.purchaseCount} sales in trailing 30 days`,
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
        emptyMessage="More granular revenue charts can be added once you have multiple months of sales."
        footerLink={{ href: "/tutor/courses", label: "Manage courses" }}
      />

      <section className="mt-8 overflow-hidden rounded-xl border border-[#e3e5e8] bg-white shadow-sm">
        <div className="border-b border-[#ececec] px-5 py-4">
          <h2 className="text-sm font-bold text-[#1c1d1f]">
            Per-course breakdown
          </h2>
          <p className="text-xs text-[#6a6f73]">
            Platform fees retained: {formatMinorUnitsToCurrency(feePart, "NGN")}{" "}
            (all-time).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-[#ececec] text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Units sold</th>
                <th className="px-5 py-3 text-right">Gross</th>
                <th className="px-5 py-3 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {byCourse.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-14 text-center text-[#6a6f73]"
                  >
                    No paid sales yet.
                  </td>
                </tr>
              ) : (
                byCourse.map((row) => (
                  <tr key={row.courseId} className="border-b border-[#ececec]">
                    <td className="px-5 py-3 font-medium text-[#1c1d1f]">
                      {row.title}
                    </td>
                    <td className="px-5 py-3 tabular-nums">{row.unitsSold}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatMinorUnitsToCurrency(row.grossMinor, "NGN")}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatMinorUnitsToCurrency(row.netMinor, "NGN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
