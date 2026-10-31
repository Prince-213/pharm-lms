import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { LISTING_CAP } from "@/lib/jobs/constants";
import { preferenceHash, type RankContext, rankJobs } from "@/lib/jobs/ranker";

export type ListedJob = {
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

export async function loadStudentRankContext(
  userId: string,
): Promise<RankContext> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      country: true,
      city: true,
      jobPreference: { select: { roles: true, workStyle: true } },
      enrollments: {
        where: { status: "ACTIVE" },
        select: { course: { select: { title: true } } },
        take: 12,
      },
    },
  });

  const extra = (user?.enrollments ?? [])
    .map((enrollment) => enrollment.course.title.trim())
    .filter((title) => title.length > 3);

  return {
    roles: user?.jobPreference?.roles ?? [],
    workStyle: user?.jobPreference?.workStyle ?? null,
    country: user?.country ?? null,
    city: user?.city ?? null,
    extraKeywords: extra,
  };
}

async function queryFreshJobs(): Promise<ListedJob[]> {
  const now = new Date();
  const rows = await db.scrapedJob.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { postedAt: "desc" },
    take: 240,
    select: {
      id: true,
      title: true,
      snippet: true,
      location: true,
      remote: true,
      company: true,
      source: true,
      type: true,
      salaryText: true,
      applyUrl: true,
      postedAt: true,
    },
  });
  return rows;
}

const cachedFreshJobs = unstable_cache(queryFreshJobs, ["job-board-fresh"], {
  tags: ["job-board"],
  revalidate: 3600,
});

function hydratePostedAt(job: ListedJob): ListedJob {
  if (job.postedAt instanceof Date || job.postedAt == null) return job;
  const parsed = new Date(job.postedAt);
  return {
    ...job,
    postedAt: Number.isNaN(parsed.getTime()) ? null : parsed,
  };
}

export async function getRankedJobsForStudent(
  ctx: RankContext,
): Promise<ListedJob[]> {
  const jobs = (await cachedFreshJobs()).map(hydratePostedAt);
  return rankJobs(jobs, ctx, LISTING_CAP);
}

export function listingCacheKey(ctx: RankContext): string {
  return preferenceHash(ctx);
}
