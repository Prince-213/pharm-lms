"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  type AppliedCoupon,
  CouponApplyField,
} from "@/components/student/coupon-apply-field";
import { PurchaseCourseButton } from "@/components/student/purchase-course-button";
import type { DisplayCurrency } from "@/lib/currency/types";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

/**
 * Wraps the catalog "Buy now" button with a coupon-code input (Udemy style).
 *
 * When a coupon is applied, the discount is forwarded to PurchaseCourseButton
 * so the Paystack initialize endpoint sees the code and charges the discounted
 * amount. The price display below shows the original price struck through next
 * to the new total.
 *
 * The wishlist heart sits next to the Buy now button via the `wishlist` slot
 * so the server component can keep deciding whether to render it.
 */
export function PaidPurchaseSection({
  courseId,
  basePriceMinorUnits,
  priceCurrency,
  displayCurrency,
  wishlist,
}: {
  courseId: string;
  basePriceMinorUnits: number;
  priceCurrency: string;
  displayCurrency?: DisplayCurrency;
  wishlist?: ReactNode;
}) {
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex gap-2">
        <div className="w-[80%] min-w-0 shrink-0">
          <PurchaseCourseButton
            courseId={courseId}
            displayCurrency={displayCurrency}
            coupon={applied ? { code: applied.code } : null}
            className="min-h-12 w-full rounded-sm py-3 text-base font-bold"
          />
        </div>
        {wishlist}
      </div>

      <CouponApplyField
        courseId={courseId}
        applied={applied}
        onApplied={setApplied}
        onCleared={() => setApplied(null)}
      />

      {applied ? (
        <p className="text-xs leading-snug text-muted-foreground">
          <span className="line-through">
            {formatMinorUnitsToCurrency(basePriceMinorUnits, priceCurrency)}
          </span>{" "}
          <strong className="font-bold text-[var(--foreground)] tabular-nums">
            {formatMinorUnitsToCurrency(
              applied.finalAmountMinorUnits,
              priceCurrency,
            )}
          </strong>{" "}
          <span className="font-semibold text-primary">
            ({applied.percentOff}% off with {applied.code})
          </span>
        </p>
      ) : null}
    </div>
  );
}
