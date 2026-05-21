const CURRENCY_LOCALE: Record<string, string> = {
  NGN: "en-NG",
  USD: "en-US",
};

/** `priceMinorUnits` stored as smallest currency unit (e.g. kobo, cents). */
export function formatMinorUnitsToCurrency(
  minor: number | null | undefined,
  currency: string = "NGN",
  options?: { zeroAsFree?: boolean },
) {
  if (minor === null || minor === undefined) return "—";
  if (minor === 0 && options?.zeroAsFree) return "Free";

  const code = currency.toUpperCase();
  const major = minor / 100;
  const locale = CURRENCY_LOCALE[code] ?? "en-US";
  const maxFractionDigits = code === "USD" ? 2 : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: maxFractionDigits,
      minimumFractionDigits: maxFractionDigits,
    }).format(major);
  } catch {
    return `${code} ${major.toFixed(maxFractionDigits)}`;
  }
}
