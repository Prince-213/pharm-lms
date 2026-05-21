import { getNgnPerUsd } from "@/lib/fx/ngn-usd";
import { resolveCourseDisplayPrice } from "./resolve-course-display-price";
import { PAYSTACK_CHARGE_CURRENCY, type DisplayCurrency } from "./types";

export type PurchasePricing = {
  chargeMinorUnits: number;
  chargeCurrency: typeof PAYSTACK_CHARGE_CURRENCY;
  displayCurrency: DisplayCurrency;
  displayAmountMinorUnits: number;
  fxRateNgnPerUsd: number | null;
};

export async function buildPurchasePricing(
  priceMinorUnitsNgn: number,
  displayCurrency: DisplayCurrency,
): Promise<PurchasePricing> {
  const resolved = await resolveCourseDisplayPrice(
    priceMinorUnitsNgn,
    displayCurrency,
  );

  const chargeMinorUnits = resolved.chargeMinorUnitsNgn ?? priceMinorUnitsNgn;
  const displayAmountMinorUnits =
    resolved.displayMinorUnits ?? priceMinorUnitsNgn;

  let fxRateNgnPerUsd: number | null = null;
  if (displayCurrency === "USD") {
    fxRateNgnPerUsd = await getNgnPerUsd();
  }

  return {
    chargeMinorUnits,
    chargeCurrency: PAYSTACK_CHARGE_CURRENCY,
    displayCurrency: resolved.displayCurrency,
    displayAmountMinorUnits,
    fxRateNgnPerUsd,
  };
}
