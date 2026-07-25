import { Receipt } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoursePurchaseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { roleHomePath } from "@/lib/rbac";

function statusLabel(status: CoursePurchaseStatus): string {
  switch (status) {
    case CoursePurchaseStatus.SUCCESS:
      return "Paid";
    case CoursePurchaseStatus.PENDING:
      return "Pending";
    case CoursePurchaseStatus.FAILED:
      return "Failed";
    default:
      return status;
  }
}

function statusVariant(
  status: CoursePurchaseStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === CoursePurchaseStatus.SUCCESS) return "default";
  if (status === CoursePurchaseStatus.FAILED) return "destructive";
  return "secondary";
}

export default async function StudentPurchasesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/purchases");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const purchases = await db.coursePurchase.findMany({
    where: { studentId: session.user.id },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      amountMinorUnits: true,
      currency: true,
      displayCurrency: true,
      displayAmountMinorUnits: true,
      discountMinorUnits: true,
      paystackReference: true,
      paidAt: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
        },
      },
      coupon: { select: { code: true } },
    },
  });

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Purchase history
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Receipts for courses you bought on PharmLMS. Open a course to
            continue learning.
          </p>
        </div>
        <Link
          href="/student/browse"
          className="text-sm font-bold text-[var(--primary)] hover:underline"
        >
          Browse more courses
        </Link>
      </div>

      {purchases.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No purchases yet"
          description="When you buy a paid course, the receipt and payment reference will show up here."
          actionHref="/student/browse"
          actionLabel="Browse catalog"
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Reference</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => {
                const when = p.paidAt ?? p.createdAt;
                const amount =
                  p.displayAmountMinorUnits != null && p.displayCurrency
                    ? formatMinorUnitsToCurrency(
                        p.displayAmountMinorUnits,
                        p.displayCurrency,
                      )
                    : formatMinorUnitsToCurrency(
                        p.amountMinorUnits,
                        p.currency,
                      );
                const canOpen =
                  p.status === CoursePurchaseStatus.SUCCESS ||
                  p.status === CoursePurchaseStatus.PENDING;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.course.title}</p>
                        {p.coupon?.code ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Coupon {p.coupon.code}
                            {p.discountMinorUnits > 0
                              ? ` · −${formatMinorUnitsToCurrency(p.discountMinorUnits, p.currency)}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {when.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-semibold">
                      {amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[180px] truncate font-mono text-xs text-muted-foreground md:table-cell">
                      {p.paystackReference}
                    </TableCell>
                    <TableCell className="text-right">
                      {canOpen ? (
                        <Link
                          href={`/student/course/${p.course.id}`}
                          className="text-sm font-semibold text-[var(--primary)] hover:underline"
                        >
                          Open
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
