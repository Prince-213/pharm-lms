/** `priceMinorUnits` stored as smallest currency unit (e.g. kobo). */
export function formatMinorUnitsToCurrency(
  minor: number | null | undefined,
  currency: string = "NGN",
  options?: { zeroAsFree?: boolean },
) {
  if (minor === null || minor === undefined) return "—";
  if (minor === 0 && options?.zeroAsFree) return "Free";

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
