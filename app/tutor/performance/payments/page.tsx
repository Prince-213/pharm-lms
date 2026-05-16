import { auth } from "@/auth";
import { CoursePurchaseStatus, UserRole } from "@/generated/prisma/enums";
import { PerformanceToolbar } from "@/components/mentor/performance/performance-toolbar";
import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { roleHomePath } from "@/lib/rbac";
import { redirect } from "next/navigation";

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!d) return "***";
  return `${u.slice(0, 2)}***@${d}`;
}

export default async function TutorPerformancePaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) redirect(roleHomePath(session.user.role));

  const mentorId = session.user.id;

  const rows = await db.coursePurchase.findMany({
    where: { mentorId, status: CoursePurchaseStatus.SUCCESS },
    orderBy: { paidAt: "desc" },
    take: 80,
    select: {
      id: true,
      amountMinorUnits: true,
      platformFeeMinorUnits: true,
      netToMentorMinorUnits: true,
      paystackReference: true,
      paidAt: true,
      course: { select: { title: true } },
      student: { select: { email: true } },
    },
  });

  return (
    <>
      <PerformanceToolbar
        title="Payments"
        subtitle="Successful course purchases credited to your account."
        dateRangeLabel="Latest 80"
      />
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]/50 text-xs font-semibold uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3">Ref</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--muted)]"
                  >
                    No payments yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--border)]/60"
                  >
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {r.paidAt?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3">{r.course.title}</td>
                    <td className="px-4 py-3 text-xs">
                      {maskEmail(r.student.email)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatMinorUnitsToCurrency(r.amountMinorUnits, "NGN")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--muted)]">
                      {formatMinorUnitsToCurrency(
                        r.platformFeeMinorUnits,
                        "NGN",
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatMinorUnitsToCurrency(
                        r.netToMentorMinorUnits,
                        "NGN",
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--muted)]">
                      {r.paystackReference}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
