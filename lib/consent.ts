export const CONSENT_COOKIE = "pharm_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentChoice = "essential" | "all";

export function parseConsent(
  value: string | undefined | null,
): ConsentChoice | null {
  if (value === "essential" || value === "all") return value;
  return null;
}
