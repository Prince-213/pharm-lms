/**
 * Picks the nav label for the longest href prefix that matches `pathname`.
 * Use for shell headers when the active sidebar item should mirror the title.
 */
export function shellHeaderTitleFromNav(
  pathname: string,
  items: readonly { href: string; label: string }[],
  fallback: string,
): string {
  const norm = pathname.replace(/\/$/, "") || "/";
  let best = fallback;
  let bestLen = -1;
  for (const item of items) {
    const h = item.href.replace(/\/$/, "") || "/";
    if (norm === h || norm.startsWith(`${h}/`)) {
      if (h.length > bestLen) {
        best = item.label;
        bestLen = h.length;
      }
    }
  }
  return best;
}
