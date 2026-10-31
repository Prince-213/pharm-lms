import { DEFAULT_PATHWAY_ROLES, ROLE_KEYWORDS } from "@/lib/jobs/constants";

export type RankableJob = {
  id: string;
  title: string;
  snippet: string | null;
  location: string | null;
  remote: boolean;
  company: string | null;
  source: string;
  type: string | null;
  salaryText: string | null;
  applyUrl: string;
  postedAt: Date | string | null;
};

export type RankContext = {
  roles: string[];
  workStyle?: string | null;
  country?: string | null;
  city?: string | null;
  extraKeywords?: string[];
};

/** A job must have at least one role-keyword hit on title or company. */
export const RANK_SCORE_FLOOR = 1;

function roleKeywords(ctx: RankContext): string[] {
  const roles = ctx.roles.length ? ctx.roles : [...DEFAULT_PATHWAY_ROLES];
  const words = new Set<string>();
  for (const role of roles) {
    for (const kw of ROLE_KEYWORDS[role] ?? [role]) {
      words.add(kw.toLowerCase());
    }
  }
  return [...words];
}

function postedAtMs(value: Date | string | number | null | undefined): number {
  if (value == null) return 0;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const ms = Date.parse(String(value));
  return Number.isNaN(ms) ? 0 : ms;
}

export function scoreJob(job: RankableJob, ctx: RankContext): number {
  const titleHay = `${job.title} ${job.company ?? ""}`.toLowerCase();
  let roleHits = 0;
  for (const token of roleKeywords(ctx)) {
    if (titleHay.includes(token)) {
      roleHits += token.length > 8 ? 3 : 2;
    }
  }
  if (roleHits < RANK_SCORE_FLOOR) return 0;

  let score = roleHits;
  for (const phrase of ctx.extraKeywords ?? []) {
    const needle = phrase.trim().toLowerCase();
    if (needle.length > 3 && titleHay.includes(needle)) score += 2;
  }
  if (ctx.workStyle === "REMOTE" && job.remote) score += 4;
  if (ctx.workStyle === "COUNTRY" && ctx.country) {
    if (
      (job.location ?? "").toLowerCase().includes(ctx.country.toLowerCase())
    ) {
      score += 4;
    }
  }
  if (
    ctx.city &&
    (job.location ?? "").toLowerCase().includes(ctx.city.toLowerCase())
  ) {
    score += 2;
  }
  return score;
}

export function rankJobs<T extends RankableJob>(
  jobs: T[],
  ctx: RankContext,
  limit: number,
): T[] {
  return [...jobs]
    .map((job) => ({ job, score: scoreJob(job, ctx) }))
    .filter((row) => row.score >= RANK_SCORE_FLOOR)
    .sort(
      (a, b) =>
        b.score - a.score ||
        postedAtMs(b.job.postedAt) - postedAtMs(a.job.postedAt),
    )
    .slice(0, limit)
    .map((row) => row.job);
}

export function preferenceHash(ctx: RankContext): string {
  return [
    [...ctx.roles].sort().join(","),
    ctx.workStyle ?? "",
    ctx.country ?? "",
    ctx.city ?? "",
    ...(ctx.extraKeywords ?? []),
  ].join("|");
}
