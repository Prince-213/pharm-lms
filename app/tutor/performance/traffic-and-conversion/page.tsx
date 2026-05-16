import { auth } from "@/auth";
import { CoursePurchaseStatus, UserRole } from "@/generated/prisma/enums";
import { PerformanceChartPanel } from "@/components/mentor/performance/performance-chart-panel";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function PerformanceTrafficPage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) redirect(roleHomePath(session.user.role));

  const mentorId = session.user.id;

  const [enrollments, checkoutStarted, purchaseComplete] = await Promise.all([
    db.enrollment.count({ where: { course: { mentorId } } }),
    db.coursePurchase.count({
      where: { mentorId, status: CoursePurchaseStatus.PENDING },
    }),
    db.coursePurchase.count({
      where: { mentorId, status: CoursePurchaseStatus.SUCCESS },
    }),
  ]);

  const checkoutAll =
    (await db.coursePurchase.count({ where: { mentorId } })) || 1;

  const funnel = [
    {
      label: "Landing views",
      value: "—",
      width: 100,
    },
    {
      label: "Curriculum expand",
      value: "—",
      width: 78,
    },
    {
      label: "Checkout started (pending)",
      value: String(checkoutStarted),
      width: Math.max(24, Math.round((checkoutStarted / checkoutAll) * 100)),
    },
    {
      label: "Purchase complete",
      value: String(purchaseComplete),
      width: Math.max(
        24,
        Math.round((purchaseComplete / Math.max(checkoutAll, 1)) * 100),
      ),
    },
  ];

  return (
    <>
      <PerformanceToolbar
        title="Traffic & conversion"
        subtitle="Enrollment and checkout signals from your catalog (traffic analytics still placeholder)."
        dateRangeLabel="All time"
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Visitors", value: "—" },
          {
            label: "Total enrollments",
            value: String(enrollments),
          },
          {
            label: "Paid sales",
            value: String(purchaseComplete),
          },
          { label: "Pending checkouts", value: String(checkoutStarted) },
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
            Checkout funnel (Paystack)
          </h2>
          <p className="mt-1 text-xs text-[#6a6f73]">
            Relative bar widths use purchase counts. Full traffic tracking is
            not wired yet.
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
                    style={{ width: `${Math.min(100, step.width)}%` }}
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
