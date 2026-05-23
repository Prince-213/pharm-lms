import { getNgnPerUsd } from "@/lib/fx/ngn-usd";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import type { DisplayCurrency } from "./types";

/**
 * Landing program cards store illustrative prices as USD major units (e.g. 17.84).
 */
export async function formatLandingUsdMajorPrice(
  usdMajor: number,
  displayCurrency: DisplayCurrency,
): Promise<string> {
  if (usdMajor === 0) return "Free";

  if (displayCurrency === "USD") {
    return formatMinorUnitsToCurrency(Math.round(usdMajor * 100), "USD");
  }

  const ngnPerUsd = await getNgnPerUsd();
  const ngnMinor = Math.round(usdMajor * ngnPerUsd * 100);
  return formatMinorUnitsToCurrency(ngnMinor, "NGN");
}
