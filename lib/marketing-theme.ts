export const MARKETING_THEME_STORAGE_KEY = "pharm-marketing-theme";
export const MARKETING_THEME_ATTR = "data-marketing-theme";
export const MARKETING_THEME_READY_CLASS = "marketing-theme-ready";

export type MarketingTheme = "light" | "dark";

export function isMarketingTheme(
  value: string | null,
): value is MarketingTheme {
  return value === "light" || value === "dark";
}

export function getStoredMarketingTheme(): MarketingTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(MARKETING_THEME_STORAGE_KEY);
    return isMarketingTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getSystemMarketingTheme(): MarketingTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getResolvedMarketingTheme(): MarketingTheme {
  return getStoredMarketingTheme() ?? getSystemMarketingTheme();
}

export function applyMarketingTheme(theme: MarketingTheme | null): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme) {
    root.setAttribute(MARKETING_THEME_ATTR, theme);
  } else {
    root.removeAttribute(MARKETING_THEME_ATTR);
  }
}

export function setMarketingTheme(theme: MarketingTheme): void {
  try {
    window.localStorage.setItem(MARKETING_THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage — still apply for this session.
  }
  applyMarketingTheme(theme);
}

export function toggleMarketingTheme(): MarketingTheme {
  const next: MarketingTheme =
    getResolvedMarketingTheme() === "dark" ? "light" : "dark";
  setMarketingTheme(next);
  return next;
}

export function markMarketingThemeReady(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(MARKETING_THEME_READY_CLASS);
}

/** Blocking bootstrap — apply a saved choice before first paint. */
export const MARKETING_THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("${MARKETING_THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("${MARKETING_THEME_ATTR}",t);}}catch(e){}})();`;
