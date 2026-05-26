"use client";

import { Ticket, X } from "lucide-react";
import { useState, useTransition } from "react";

export type AppliedCoupon = {
  code: string;
  percentOff: number;
  discountMinorUnits: number;
  finalAmountMinorUnits: number;
};

type CouponValidateResponse =
  | {
      ok: true;
      code: string;
      percentOff: number;
      basePriceMinorUnits: number;
      discountMinorUnits: number;
      finalAmountMinorUnits: number;
    }
  | { ok: false; message?: string };

export function CouponApplyField({
  courseId,
  applied,
  onApplied,
  onCleared,
}: {
  courseId: string;
  applied: AppliedCoupon | null;
  onApplied: (coupon: AppliedCoupon) => void;
  onCleared: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a coupon code.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, code: trimmed }),
        });
        const data = (await res
          .json()
          .catch(() => ({}))) as CouponValidateResponse;
        if (!res.ok || !data.ok) {
          setError(
            (data && "message" in data && data.message) ||
              "Coupon code is invalid.",
          );
          return;
        }
        onApplied({
          code: data.code,
          percentOff: data.percentOff,
          discountMinorUnits: data.discountMinorUnits,
          finalAmountMinorUnits: data.finalAmountMinorUnits,
        });
        setCode("");
        setOpen(false);
      } catch {
        setError("Network error. Try again.");
      }
    });
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
        <span className="flex min-w-0 items-center gap-2 text-emerald-800">
          <Ticket className="h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0 truncate">
            <strong className="font-mono font-bold tracking-wide">
              {applied.code}
            </strong>{" "}
            applied — {applied.percentOff}% off
          </span>
        </span>
        <button
          type="button"
          onClick={() => onCleared()}
          aria-label="Remove coupon"
          className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold text-emerald-900 underline-offset-2 hover:underline"
        >
          <X className="h-3 w-3" aria-hidden />
          Remove
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-[var(--primary)] underline underline-offset-2 hover:text-[var(--primary-strong)]"
      >
        <Ticket className="h-3.5 w-3.5" aria-hidden />
        Have a coupon?
      </button>
    );
  }

  return (
    <form onSubmit={onApply} className="flex flex-col gap-1.5">
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          ref={(node) => {
            // Auto-focus the input when the field opens so users can type
            // immediately without an extra click (Udemy-style behavior).
            node?.focus();
          }}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon"
          maxLength={40}
          className="h-10 min-w-0 flex-1 rounded-sm border border-[#d1d7dc] bg-white px-3 font-mono text-sm uppercase tracking-wide outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm border-2 border-[var(--foreground)] bg-transparent px-3 text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[#f7f9fa] disabled:opacity-50"
        >
          {pending ? "Applying…" : "Apply"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setCode("");
            setError(null);
          }}
          aria-label="Close coupon field"
          className="inline-flex h-10 w-8 shrink-0 items-center justify-center rounded-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <p className="text-xs font-semibold text-rose-700">{error}</p>
      ) : null}
    </form>
  );
}
