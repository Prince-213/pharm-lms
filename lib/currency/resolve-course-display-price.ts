import { convertNgnMinorToUsdMinor } from "@/lib/fx/ngn-usd";
import type { DisplayCurrency } from "./types";

export type CourseDisplayPrice = {
  displayCurrency: DisplayCurrency;
  displayMinorUnits: number | null;
  /** NGN kobo charged on Paystack (source of truth from course). */
  chargeMinorUnitsNgn: number | null;
};

/**
 * NGN stored on course; USD display computed via FX when needed.
 */
export async function resolveCourseDisplayPrice(
  priceMinorUnitsNgn: number | null | undefined,
  displayCurrency: DisplayCurrency,
): Promise<CourseDisplayPrice> {
  const ngnMinor =
    priceMinorUnitsNgn == null ? null : Math.max(0, priceMinorUnitsNgn);

  if (ngnMinor === null) {
    return {
      displayCurrency,
      displayMinorUnits: null,
      chargeMinorUnitsNgn: null,
    };
  }

  if (displayCurrency === "NGN") {
    return {
      displayCurrency: "NGN",
      displayMinorUnits: ngnMinor,
      chargeMinorUnitsNgn: ngnMinor,
    };
  }

  const usdMinor = await convertNgnMinorToUsdMinor(ngnMinor);
  return {
    displayCurrency: "USD",
    displayMinorUnits: usdMinor,
    chargeMinorUnitsNgn: ngnMinor,
  };
}
