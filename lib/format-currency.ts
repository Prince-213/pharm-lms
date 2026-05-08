/** `priceMinorUnits` stored as smallest currency unit (e.g. kobo). */
export function formatMinorUnitsToCurrency(
  minor: number | null | undefined,
  currency: string = "NGN",
) {
  if (minor === null || minor === undefined) return "—";
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}
