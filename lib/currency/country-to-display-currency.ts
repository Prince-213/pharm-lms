import type { DisplayCurrency } from "./types";

const NIGERIA_CODES = new Set(["NG", "NGA"]);
const NIGERIA_NAMES = new Set(["nigeria", "ng", "nga"]);

/** Map profile country string or ISO code to display currency. */
export function countryToDisplayCurrency(
  country: string | null | undefined,
): DisplayCurrency | null {
  const raw = country?.trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  if (NIGERIA_CODES.has(upper)) return "NGN";

  const lower = raw.toLowerCase();
  if (NIGERIA_NAMES.has(lower)) return "NGN";

  return "USD";
}

export function isoCountryToDisplayCurrency(
  isoCode: string | null | undefined,
): DisplayCurrency | null {
  if (!isoCode?.trim()) return null;
  return isoCode.trim().toUpperCase() === "NG" ? "NGN" : "USD";
}

export function getDefaultDisplayCurrency(): DisplayCurrency {
  const env = process.env.DEFAULT_DISPLAY_CURRENCY?.trim().toUpperCase();
  if (env === "NGN" || env === "USD") return env;
  return "USD";
}
