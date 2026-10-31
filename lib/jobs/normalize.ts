export type NormalizedJob = {
  applyUrl: string;
  source: string;
  title: string;
  company: string | null;
  location: string | null;
  remote: boolean;
  type: string | null;
  salaryText: string | null;
  snippet: string | null;
  postedAt: Date | null;
};

export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function stripHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 280) : null;
}

export function asDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function looksRemote(location: string | null, flag?: boolean): boolean {
  if (flag) return true;
  if (!location) return false;
  return /remote|worldwide|anywhere|distributed/i.test(location);
}
