/**
 * Pure helpers for turning a percentage coupon into a discounted amount.
 * Money is stored in minor units (kobo/cents) project-wide so all math is
 * integer arithmetic (no floating-point rounding surprises).
 */

export type DiscountResult = {
  /** Whole minor units shaved off the original price. Always >= 0. */
  discountMinorUnits: number;
  /** Original price minus discount. Always >= 0. */
  finalAmountMinorUnits: number;
};

/**
 * Compute `floor(price * percent / 100)` discount and clamp the final amount
 * to a non-negative integer. Floor rounding favors the customer marginally
 * (a 33% coupon on NGN 1,000 = NGN 333 off, not 334), matching how Udemy
 * shows whole-currency discounts.
 */
export function computeDiscount(
  priceMinorUnits: number,
  percentOff: number,
): DiscountResult {
  if (!Number.isFinite(priceMinorUnits) || priceMinorUnits <= 0) {
    return { discountMinorUnits: 0, finalAmountMinorUnits: 0 };
  }
  const pct = Math.max(0, Math.min(100, Math.floor(percentOff)));
  const discount = Math.floor((priceMinorUnits * pct) / 100);
  const safeDiscount = Math.max(0, Math.min(discount, priceMinorUnits));
  const final = Math.max(0, priceMinorUnits - safeDiscount);
  return {
    discountMinorUnits: safeDiscount,
    finalAmountMinorUnits: final,
  };
}
