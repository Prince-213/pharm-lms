"use client";

import { Power, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteCouponAction,
  toggleCouponActiveAction,
} from "@/app/admin/coupons/actions";

export type AdminCouponRow = {
  id: string;
  code: string;
  percentOff: number;
  expiresAt: string | null;
  maxRedemptions: number | null;
  maxRedemptionsPerStudent: number;
  isActive: boolean;
  redemptionCount: number;
  createdAt: string;
  courses: Array<{ id: string; title: string }>;
};

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t <= Date.now();
}

export function AdminCouponsTable({ coupons }: { coupons: AdminCouponRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onToggle(coupon: AdminCouponRow) {
    setPendingId(coupon.id);
    startTransition(async () => {
      const result = await toggleCouponActiveAction(coupon.id);
      setPendingId(null);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        result.isActive
          ? `${coupon.code} is now active.`
          : `${coupon.code} is now inactive.`,
      );
      router.refresh();
    });
  }

  function onDelete(coupon: AdminCouponRow) {
    if (
      !window.confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)
    ) {
      return;
    }
    setPendingId(coupon.id);
    startTransition(async () => {
      const result = await deleteCouponAction(coupon.id);
      setPendingId(null);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Coupon ${coupon.code} deleted.`);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Code
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Discount
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Courses
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Uses
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Per student
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Expires
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5">
              Status
            </th>
            <th className="border-b border-[var(--border)] px-3 py-2.5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => {
            const expired = isExpired(c.expiresAt);
            const exhausted =
              c.maxRedemptions != null && c.redemptionCount >= c.maxRedemptions;
            const statusLabel = !c.isActive
              ? "Inactive"
              : expired
                ? "Expired"
                : exhausted
                  ? "Used up"
                  : "Active";
            const statusClass = !c.isActive
              ? "bg-slate-100 text-slate-600"
              : expired
                ? "bg-amber-50 text-amber-800"
                : exhausted
                  ? "bg-amber-50 text-amber-800"
                  : "bg-primary/10 text-primary";
            const busy = pendingId === c.id;
            return (
              <tr
                key={c.id}
                className="text-sm text-[var(--foreground)] [&>td]:border-b [&>td]:border-[var(--border)]"
              >
                <td className="px-3 py-3 font-mono font-bold tracking-wide text-[var(--foreground)]">
                  {c.code}
                </td>
                <td className="px-3 py-3 tabular-nums">{c.percentOff}% off</td>
                <td className="px-3 py-3">
                  {c.courses.length === 0 ? (
                    <span className="text-muted-foreground">No courses</span>
                  ) : c.courses.length === 1 ? (
                    <span title={c.courses[0].title}>{c.courses[0].title}</span>
                  ) : (
                    <span
                      title={c.courses.map((co) => co.title).join("\n")}
                      className="cursor-help"
                    >
                      {c.courses[0].title}{" "}
                      <span className="text-muted-foreground">
                        + {c.courses.length - 1} more
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {c.redemptionCount}
                  {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {c.maxRedemptionsPerStudent}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatDate(c.expiresAt)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onToggle(c)}
                      title={c.isActive ? "Deactivate" : "Activate"}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] disabled:opacity-50"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete(c)}
                      title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
