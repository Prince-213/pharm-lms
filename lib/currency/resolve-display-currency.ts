import { countryToDisplayCurrency, getDefaultDisplayCurrency, isoCountryToDisplayCurrency } from "./country-to-display-currency";
import { getRequestCountryCode } from "./get-request-country";
import type { DisplayCurrency } from "./types";

export type ResolveDisplayCurrencyInput = {
  /** Logged-in user profile country (overrides geo when set). */
  profileCountry?: string | null;
};

/**
 * Geo/IP first; profile `country` overrides when set.
 * Nigeria → NGN; all other countries → USD display.
 */
export async function resolveDisplayCurrency(
  input?: ResolveDisplayCurrencyInput,
): Promise<DisplayCurrency> {
  const geo = await getRequestCountryCode();
  let currency: DisplayCurrency =
    isoCountryToDisplayCurrency(geo) ?? getDefaultDisplayCurrency();

  const fromProfile = countryToDisplayCurrency(input?.profileCountry);
  if (fromProfile) currency = fromProfile;

  return currency;
}
