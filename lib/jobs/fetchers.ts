import {
  APIFY_DEFAULT_ACTOR,
  APIFY_MAX_CHARGE_USD,
  APIFY_MAX_ITEMS,
  APIFY_PLATFORMS,
  type JobSourceId,
  TITLE_KEEP_RE,
  USER_AGENT,
} from "@/lib/jobs/constants";
import {
  asDate,
  looksRemote,
  type NormalizedJob,
  normalizeUrl,
  stripHtml,
} from "@/lib/jobs/normalize";

type FetchOk = { source: JobSourceId; jobs: NormalizedJob[] };
type FetchFail = { source: JobSourceId; error: string; status?: number };
export type SourceResult = FetchOk | FetchFail;

function isFail(r: SourceResult): r is FetchFail {
  return "error" in r;
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ status: number; data: unknown; text?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    if (!text) return { status: res.status, data: null };
    try {
      return { status: res.status, data: JSON.parse(text), text };
    } catch {
      return { status: res.status, data: null, text };
    }
  } finally {
    clearTimeout(timer);
  }
}

function apifyErrorMessage(
  status: number,
  data: unknown,
  text?: string,
): string {
  if (data && typeof data === "object") {
    const rec = data as {
      error?: { message?: string } | string;
      message?: string;
    };
    if (typeof rec.error === "string") return rec.error;
    if (rec.error && typeof rec.error === "object" && rec.error.message) {
      return rec.error.message;
    }
    if (typeof rec.message === "string") return rec.message;
  }
  if (text?.includes("Request blocked") || text?.includes("CloudFront")) {
    return "CloudFront blocked the request";
  }
  return `HTTP ${status}`;
}

function mapApifyCountry(raw: string): {
  country: string;
  remoteOnly: boolean;
} {
  const value = raw.trim();
  if (!value || /^remote$/i.test(value)) {
    return { country: "United States", remoteOnly: true };
  }
  const aliases: Record<string, string> = {
    nigeria: "Nigeria",
    ng: "Nigeria",
    ghana: "Ghana",
    kenya: "Kenya",
    "south africa": "South Africa",
    "united kingdom": "United Kingdom",
    uk: "United Kingdom",
    "united states": "United States",
    usa: "United States",
    us: "United States",
    canada: "Canada",
    india: "India",
    germany: "Germany",
    france: "France",
  };
  return {
    country: aliases[value.toLowerCase()] ?? "United States",
    remoteOnly: false,
  };
}

function locationText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "raw" in value) {
    const raw = (value as { raw?: unknown }).raw;
    return raw ? String(raw) : null;
  }
  return null;
}

function keepJob(title: string, extra: string[] = [], snippet = ""): boolean {
  if (TITLE_KEEP_RE.test(title)) return true;
  if (snippet && TITLE_KEEP_RE.test(snippet)) return true;
  const hay = title.toLowerCase();
  return extra.some((k) => hay.includes(k.toLowerCase()));
}

function toJob(
  source: string,
  raw: {
    url?: unknown;
    title?: unknown;
    company?: unknown;
    location?: unknown;
    remote?: boolean;
    type?: unknown;
    salary?: unknown;
    snippet?: unknown;
    postedAt?: unknown;
  },
): NormalizedJob | null {
  const applyUrl = normalizeUrl(String(raw.url ?? ""));
  const title = String(raw.title ?? "").trim();
  if (!applyUrl || !title) return null;
  const location = raw.location ? String(raw.location).trim() : null;
  return {
    applyUrl,
    source,
    title: title.slice(0, 200),
    company: raw.company ? String(raw.company).slice(0, 160) : null,
    location: location ? location.slice(0, 160) : null,
    remote: looksRemote(location, raw.remote),
    type: raw.type ? String(raw.type).slice(0, 80) : null,
    salaryText: raw.salary ? String(raw.salary).slice(0, 120) : null,
    snippet: stripHtml(raw.snippet ? String(raw.snippet) : null),
    postedAt: asDate(raw.postedAt),
  };
}

async function fetchRemoteOK(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://remoteok.com/api",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    if (status >= 400 || !Array.isArray(data)) {
      return { source: "remoteok", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of data as Record<string, unknown>[]) {
      if (!row || typeof row !== "object" || row.legal) continue;
      const job = toJob("remoteok", {
        url: row.url || row.apply_url,
        title: row.position || row.title,
        company: row.company,
        location: row.location,
        remote: true,
        type: "Remote",
        salary:
          row.salary_min && row.salary_max
            ? `${row.salary_min}–${row.salary_max} ${row.salary_currency ?? ""}`
            : null,
        snippet: row.description,
        postedAt: row.date,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "remoteok", jobs };
  } catch (error) {
    return {
      source: "remoteok",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchJobicy(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://jobicy.com/api/v2/remote-jobs?count=50&tag=health",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "jobs" in data
        ? (data as { jobs?: unknown }).jobs
        : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return { source: "jobicy", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const job = toJob("jobicy", {
        url: row.url || row.jobUrl,
        title: row.jobTitle || row.title,
        company: row.companyName,
        location: row.jobGeo,
        remote: true,
        type: row.jobType,
        salary: row.salaryRange || row.annualSalaryMin,
        snippet: row.jobExcerpt || row.jobDescription,
        postedAt: row.pubDate,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "jobicy", jobs };
  } catch (error) {
    return {
      source: "jobicy",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchArbeitnow(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://www.arbeitnow.com/api/job-board-api?page=1",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "data" in data
        ? (data as { data?: unknown }).data
        : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return { source: "arbeitnow", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const job = toJob("arbeitnow", {
        url: row.url,
        title: row.title,
        company: row.company_name,
        location: row.location,
        remote: Boolean(row.remote),
        type: Array.isArray(row.job_types)
          ? String(row.job_types[0] ?? "")
          : null,
        snippet: Array.isArray(row.tags) ? row.tags.join(", ") : null,
        postedAt: row.created_at,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "arbeitnow", jobs };
  } catch (error) {
    return {
      source: "arbeitnow",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchHimalayas(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://himalayas.app/jobs/api/search?q=healthcare&limit=20",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "jobs" in data
        ? (data as { jobs?: unknown }).jobs
        : Array.isArray(data)
          ? data
          : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return { source: "himalayas", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const salary =
        row.minSalary && row.maxSalary
          ? `${row.minSalary}–${row.maxSalary} ${row.currency ?? ""}`.trim()
          : null;
      const loc = Array.isArray(row.locationRestrictions)
        ? row.locationRestrictions.filter(Boolean).join(", ")
        : null;
      const job = toJob("himalayas", {
        url: row.applicationLink || row.guid,
        title: row.title,
        company: row.companyName,
        location: loc || "Remote",
        remote: true,
        type: row.employmentType,
        salary,
        snippet: row.excerpt || row.description,
        postedAt: row.pubDate,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "himalayas", jobs };
  } catch (error) {
    return {
      source: "himalayas",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchFourDayWeek(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://4dayweek.io/api/v2/jobs?limit=50&q=health",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "data" in data
        ? (data as { data?: unknown }).data
        : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return { source: "fourdayweek", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const company =
        row.company && typeof row.company === "object"
          ? (row.company as { name?: string }).name
          : null;
      const locs = Array.isArray(row.locations)
        ? (row.locations as { country?: string; city?: string }[])
            .map((l) => [l.city, l.country].filter(Boolean).join(", "))
            .filter(Boolean)
            .join("; ")
        : null;
      const job = toJob("fourdayweek", {
        url: row.url || (row.slug ? `https://4dayweek.io/job/${row.slug}` : ""),
        title: row.title,
        company,
        location: locs,
        remote: String(row.work_arrangement ?? "").includes("remote"),
        type: row.schedule_type || row.level,
        snippet: row.description,
        postedAt: row.posted_at,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "fourdayweek", jobs };
  } catch (error) {
    return {
      source: "fourdayweek",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchJobRemotely(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://jobremotely.io/api/v1/jobs?limit=50&sort=newest",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "data" in data
        ? ((data as { data?: { jobs?: unknown } }).data?.jobs ??
          (data as { data?: unknown }).data)
        : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return { source: "jobremotely", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const salary =
        row.salary && typeof row.salary === "object"
          ? `${(row.salary as { min?: number }).min ?? ""}–${(row.salary as { max?: number }).max ?? ""} ${(row.salary as { currency?: string }).currency ?? ""}`.trim()
          : null;
      const job = toJob("jobremotely", {
        url:
          row.url ||
          (row.slug ? `https://jobremotely.io/jobs/${row.slug}` : ""),
        title: row.title,
        location: row.location,
        remote: String(row.jobType ?? "").toUpperCase() === "REMOTE",
        type: row.jobType || row.category,
        salary,
        snippet: Array.isArray(row.skillsRequired)
          ? row.skillsRequired.join(", ")
          : row.category,
        postedAt: row.createdAt,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "jobremotely", jobs };
  } catch (error) {
    return {
      source: "jobremotely",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchRemoteJobsOrg(extra: string[]): Promise<SourceResult> {
  try {
    const { status, data } = await fetchJson(
      "https://remotejobs.org/api/v1/jobs?limit=50",
      { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "data" in data
        ? (data as { data?: unknown }).data
        : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return { source: "remotejobsorg", error: `HTTP ${status}`, status };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const company =
        row.company && typeof row.company === "object"
          ? (row.company as { name?: string }).name
          : null;
      const salary =
        row.salary_text ||
        (row.salary_min && row.salary_max
          ? `${row.salary_min}–${row.salary_max} ${row.salary_currency ?? ""}`
          : null);
      const job = toJob("remotejobsorg", {
        url: row.apply_url || row.url,
        title: row.title,
        company,
        location: row.location,
        remote: true,
        type: Array.isArray(row.employment_types)
          ? String(row.employment_types[0] ?? "")
          : row.type,
        salary,
        snippet: row.description,
        postedAt: row.posted_at,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "remotejobsorg", jobs };
  } catch (error) {
    return {
      source: "remotejobsorg",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function fetchTheMuse(extra: string[]): Promise<SourceResult> {
  try {
    // www.themuse.com/api/public is CloudFront-WAF blocked from many server IPs.
    // The documented legacy host still serves the same jobs API.
    const { status, data, text } = await fetchJson(
      "https://api-v2.themuse.com/jobs?category=Healthcare&page=1",
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      8000,
    );
    const jobsArr =
      data && typeof data === "object" && "results" in data
        ? (data as { results?: unknown }).results
        : null;
    if (status >= 400 || !Array.isArray(jobsArr)) {
      return {
        source: "themuse",
        error: apifyErrorMessage(status, data, text),
        status,
      };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of jobsArr as Record<string, unknown>[]) {
      const locs = Array.isArray(row.locations)
        ? (row.locations as { name?: string }[])
            .map((l) => l.name)
            .filter(Boolean)
            .join(", ")
        : null;
      const refs = row.refs as { landing_page?: string } | undefined;
      const job = toJob("themuse", {
        url: refs?.landing_page,
        title: row.name,
        company:
          row.company && typeof row.company === "object"
            ? (row.company as { name?: string }).name
            : null,
        location: locs,
        type: Array.isArray(row.levels)
          ? String((row.levels as { name?: string }[])[0]?.name ?? "")
          : null,
        snippet: row.contents,
        postedAt: row.publication_date,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "themuse", jobs };
  } catch (error) {
    return {
      source: "themuse",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

function blockedBoard(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.includes("linkedin.com") ||
      host.includes("indeed.com") ||
      host.includes("indeed.")
    );
  } catch {
    return true;
  }
}

async function fetchApify(
  extra: string[],
  location: string,
): Promise<SourceResult> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) {
    return { source: "apify", error: "unconfigured", status: 0 };
  }
  const actor = (
    process.env.APIFY_ACTOR_ID?.trim() || APIFY_DEFAULT_ACTOR
  ).replace("/", "~");
  const keyword = extra[0]?.trim() || "pharmacist";
  const { country, remoteOnly } = mapApifyCountry(location);
  const perPlatform = Math.max(
    1,
    Math.floor(APIFY_MAX_ITEMS / APIFY_PLATFORMS.length),
  );
  const query = new URLSearchParams({
    token,
    maxItems: String(APIFY_MAX_ITEMS),
    maxTotalChargeUsd: String(APIFY_MAX_CHARGE_USD),
  });
  try {
    const { status, data, text } = await fetchJson(
      `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?${query}`,
      {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          max_results: perPlatform,
          keyword,
          country,
          remote_only: remoteOnly,
          platforms: [...APIFY_PLATFORMS],
        }),
      },
      90_000,
    );
    if (status === 402 || status === 403) {
      return {
        source: "apify",
        error: `credit empty: ${apifyErrorMessage(status, data, text)}`,
        status,
      };
    }
    if (status >= 400 || !Array.isArray(data)) {
      return {
        source: "apify",
        error: apifyErrorMessage(status, data, text),
        status,
      };
    }
    const jobs: NormalizedJob[] = [];
    for (const row of data as Record<string, unknown>[]) {
      const url = String(
        row.official_url ||
          row.platform_url ||
          row.url ||
          row.applyUrl ||
          row.link ||
          "",
      );
      if (!url || blockedBoard(url)) continue;
      const loc = locationText(row.location);
      const company =
        row.company_name ||
        (row.company && typeof row.company === "object"
          ? (row.company as { name?: string }).name
          : row.company) ||
        row.companyName;
      const salaryBits = [
        row.salary_minimum,
        row.salary_maximum,
        row.salary_currency,
      ]
        .filter((part) => part != null && part !== "")
        .join(" ");
      const job = toJob("apify", {
        url,
        title: row.title || row.position,
        company,
        location: loc,
        remote: Boolean(row.remote) || remoteOnly,
        type: row.job_type || row.employmentType || row.type,
        salary: salaryBits || row.salary,
        snippet: row.description,
        postedAt: row.posted_date || row.postedAt || row.datePosted,
      });
      if (job && keepJob(job.title, extra, job.snippet ?? "")) jobs.push(job);
    }
    return { source: "apify", jobs };
  } catch (error) {
    return {
      source: "apify",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

export async function fetchAllSources(opts: {
  extraKeywords: string[];
  apifyLocation: string;
  enabled: Record<JobSourceId, boolean>;
}): Promise<SourceResult[]> {
  const extra = opts.extraKeywords;
  const named: { source: JobSourceId; task: Promise<SourceResult> }[] = [];
  if (opts.enabled.remoteok)
    named.push({ source: "remoteok", task: fetchRemoteOK(extra) });
  if (opts.enabled.jobicy)
    named.push({ source: "jobicy", task: fetchJobicy(extra) });
  if (opts.enabled.arbeitnow)
    named.push({ source: "arbeitnow", task: fetchArbeitnow(extra) });
  if (opts.enabled.themuse)
    named.push({ source: "themuse", task: fetchTheMuse(extra) });
  if (opts.enabled.himalayas)
    named.push({ source: "himalayas", task: fetchHimalayas(extra) });
  if (opts.enabled.fourdayweek)
    named.push({ source: "fourdayweek", task: fetchFourDayWeek(extra) });
  if (opts.enabled.jobremotely)
    named.push({ source: "jobremotely", task: fetchJobRemotely(extra) });
  if (opts.enabled.remotejobsorg)
    named.push({ source: "remotejobsorg", task: fetchRemoteJobsOrg(extra) });
  if (opts.enabled.apify)
    named.push({
      source: "apify",
      task: fetchApify(extra, opts.apifyLocation),
    });

  const settled = await Promise.allSettled(named.map((n) => n.task));
  return settled.map((item, i) => {
    if (item.status === "fulfilled") return item.value;
    return {
      source: named[i]?.source ?? "remoteok",
      error: item.reason instanceof Error ? item.reason.message : "rejected",
    };
  });
}

export { isFail };
