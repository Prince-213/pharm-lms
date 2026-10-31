import { revalidateTag } from "next/cache";
import { JobOnboardingStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import {
  DEFAULT_EMAIL_JOBS,
  JOB_SOURCE_HOME,
  JOB_SOURCE_LABELS,
  JOB_SOURCES,
  JOB_TTL_DAYS,
  type JobSourceId,
  ROLE_OPTIONS,
} from "@/lib/jobs/constants";
import { fetchAllSources, isFail } from "@/lib/jobs/fetchers";
import { isStudentProfileComplete } from "@/lib/jobs/profile-complete";
import { type RankContext, rankJobs } from "@/lib/jobs/ranker";
import {
  cadenceGuardActive,
  ensureSourceHealthRows,
  getEnabledSources,
  getOrCreateJobAlertSettings,
} from "@/lib/jobs/settings";
import { sendEmail } from "@/lib/notifications/email-service";
import { getJobAlertDigestTemplate } from "@/lib/notifications/job-alert-template";

export type IngestOutcome =
  | { skipped: true; reason: "disabled" | "cadence" }
  | {
      skipped: false;
      jobsStored: number;
      emailsSent: number;
      emailsSkip: number;
      runId: string;
    };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function topStudentCountry(): Promise<string> {
  const rows = await db.user.groupBy({
    by: ["country"],
    where: {
      role: UserRole.STUDENT,
      isActive: true,
      country: { not: null },
    },
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
    take: 1,
  });
  return rows[0]?.country?.trim() || "Remote";
}

async function persistSourceResult(
  source: JobSourceId,
  started: number,
  result: Awaited<ReturnType<typeof fetchAllSources>>[number],
) {
  const ms = Date.now() - started;
  if (isFail(result)) {
    const unconfigured = result.error === "unconfigured";
    await db.jobSourceHealth.upsert({
      where: { source },
      create: {
        source,
        status: unconfigured ? "UNCONFIGURED" : "DOWN",
        lastStatus: result.status ?? null,
        lastMs: ms,
        jobsKept: 0,
        lastError: result.error,
        lastRunAt: new Date(),
      },
      update: {
        status: unconfigured ? "UNCONFIGURED" : "DOWN",
        lastStatus: result.status ?? null,
        lastMs: ms,
        jobsKept: 0,
        lastError: result.error,
        lastRunAt: new Date(),
      },
    });
    return { kept: 0, ids: [] };
  }

  const expiresAt = new Date(Date.now() + JOB_TTL_DAYS * 24 * 60 * 60 * 1000);
  let kept = 0;
  const ids: string[] = [];
  for (const job of result.jobs) {
    const saved = await db.scrapedJob.upsert({
      where: { applyUrl: job.applyUrl },
      create: {
        applyUrl: job.applyUrl,
        source: job.source,
        title: job.title,
        company: job.company,
        location: job.location,
        remote: job.remote,
        type: job.type,
        salaryText: job.salaryText,
        snippet: job.snippet,
        postedAt: job.postedAt,
        expiresAt,
      },
      update: {
        source: job.source,
        title: job.title,
        company: job.company,
        location: job.location,
        remote: job.remote,
        type: job.type,
        salaryText: job.salaryText,
        snippet: job.snippet,
        postedAt: job.postedAt,
        expiresAt,
      },
    });
    ids.push(saved.id);
    kept += 1;
  }

  await db.jobSourceHealth.upsert({
    where: { source },
    create: {
      source,
      status: "HEALTHY",
      lastStatus: 200,
      lastMs: ms,
      jobsKept: kept,
      lastError: null,
      lastRunAt: new Date(),
    },
    update: {
      status: "HEALTHY",
      lastStatus: 200,
      lastMs: ms,
      jobsKept: kept,
      lastError: null,
      lastRunAt: new Date(),
    },
  });
  return { kept, ids };
}

function rolesLabel(roles: string[]): string {
  const labels = roles
    .map((id) => ROLE_OPTIONS.find((r) => r.id === id)?.label)
    .filter(Boolean);
  if (!labels.length) return "healthcare data";
  if (labels.length === 1) return labels[0] as string;
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

const digestStudentSelect = {
  id: true,
  email: true,
  fullName: true,
  country: true,
  city: true,
  jobPreference: { select: { roles: true, workStyle: true } },
  enrollments: {
    where: { status: "ACTIVE" as const },
    select: { course: { select: { title: true } } },
    take: 12,
  },
} as const;

type DigestStudent = {
  id: string;
  email: string | null;
  fullName: string | null;
  country: string | null;
  city: string | null;
  jobPreference: { roles: string[]; workStyle: string | null } | null;
  enrollments: { course: { title: string } }[];
};

const jobDigestSelect = {
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
} as const;

async function loadJobsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.scrapedJob.findMany({
    where: { id: { in: ids } },
    select: jobDigestSelect,
  });
}

async function loadFreshJobs() {
  return db.scrapedJob.findMany({
    where: { expiresAt: { gt: new Date() } },
    select: jobDigestSelect,
  });
}

async function deliveredJobIdsFor(
  userIds: string[],
  jobIds: string[],
): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  if (userIds.length === 0 || jobIds.length === 0) return map;
  const rows = await db.jobAlertDelivery.findMany({
    where: { userId: { in: userIds }, jobId: { in: jobIds } },
    select: { userId: true, jobId: true },
  });
  for (const row of rows) {
    const set = map.get(row.userId) ?? new Set<string>();
    set.add(row.jobId);
    map.set(row.userId, set);
  }
  return map;
}

async function sendDigestToStudent(
  student: DigestStudent,
  runId: string,
  maxEmailJobs: number,
  kind: "weekly" | "welcome",
  fresh: Awaited<ReturnType<typeof loadFreshJobs>>,
  already: Set<string>,
): Promise<{ sent: boolean; reason?: string }> {
  if (!isStudentProfileComplete(student) || !student.email) {
    return { sent: false, reason: "incomplete" };
  }
  const unmatched = fresh.filter((job) => !already.has(job.id));
  const extra = student.enrollments
    .map((e) => e.course.title.trim())
    .filter((title) => title.length > 3);
  const ctx: RankContext = {
    roles: student.jobPreference?.roles ?? [],
    workStyle: student.jobPreference?.workStyle ?? null,
    country: student.country,
    city: student.city,
    extraKeywords: extra,
  };
  const picks = rankJobs(unmatched, ctx, maxEmailJobs);
  if (picks.length < 1) {
    return { sent: false, reason: "no-matches" };
  }

  const html = getJobAlertDigestTemplate({
    studentName: student.fullName ?? "there",
    rolesLabel: rolesLabel(student.jobPreference?.roles ?? []),
    kind,
    jobs: picks.map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      applyUrl: job.applyUrl,
      source: JOB_SOURCE_LABELS[job.source as JobSourceId] ?? job.source,
      sourceUrl: JOB_SOURCE_HOME[job.source as JobSourceId] ?? job.applyUrl,
    })),
  });

  const sent = await sendEmail({
    to: student.email,
    subject:
      kind === "welcome"
        ? "Your first pathway matches are ready"
        : `${picks.length} role${picks.length === 1 ? "" : "s"} that match your pathway`,
    html,
  });

  if (!sent.success) return { sent: false, reason: "email-failed" };

  await db.jobAlertDelivery.createMany({
    data: picks.map((job) => ({
      userId: student.id,
      jobId: job.id,
      runId,
    })),
    skipDuplicates: true,
  });
  return { sent: true };
}

async function sendWeeklyDigests(
  runId: string,
  maxEmailJobs: number,
  newJobIds: string[],
) {
  const students = await db.user.findMany({
    where: {
      role: UserRole.STUDENT,
      isActive: true,
      jobPreference: {
        jobAlertsEnabled: true,
        onboardingStatus: {
          in: [JobOnboardingStatus.COMPLETE, JobOnboardingStatus.SKIPPED],
        },
      },
    },
    select: digestStudentSelect,
  });

  if (newJobIds.length === 0) {
    return { emailsSent: 0, emailsSkip: students.length };
  }

  const fresh = await loadJobsByIds(newJobIds);
  const delivered = await deliveredJobIdsFor(
    students.map((s) => s.id),
    fresh.map((job) => job.id),
  );
  let emailsSent = 0;
  let emailsSkip = 0;

  for (const student of students) {
    const result = await sendDigestToStudent(
      student,
      runId,
      maxEmailJobs,
      "weekly",
      fresh,
      delivered.get(student.id) ?? new Set(),
    );
    if (result.sent) emailsSent += 1;
    else emailsSkip += 1;
    await sleep(150);
  }

  return { emailsSent, emailsSkip };
}

export async function sendWelcomeJobDigest(userId: string): Promise<{
  emailed: boolean;
  reason?: string;
}> {
  const settings = await getOrCreateJobAlertSettings();
  if (!settings.enabled) return { emailed: false, reason: "disabled" };

  const student = await db.user.findUnique({
    where: { id: userId },
    select: digestStudentSelect,
  });
  if (!student) return { emailed: false, reason: "missing" };

  const fresh = await loadFreshJobs();
  const delivered = await deliveredJobIdsFor(
    [student.id],
    fresh.map((job) => job.id),
  );

  const run = await db.jobAlertRun.create({ data: {} });
  try {
    const result = await sendDigestToStudent(
      student,
      run.id,
      settings.maxEmailJobs || DEFAULT_EMAIL_JOBS,
      "welcome",
      fresh,
      delivered.get(student.id) ?? new Set(),
    );
    await db.jobAlertRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        ok: true,
        emailsSent: result.sent ? 1 : 0,
        emailsSkip: result.sent ? 0 : 1,
      },
    });
    return { emailed: result.sent, reason: result.reason };
  } catch (error) {
    const message = error instanceof Error ? error.message : "digest failed";
    await db.jobAlertRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), ok: false, error: message },
    });
    return { emailed: false, reason: "email-failed" };
  }
}

export async function runJobAlertIngest(opts?: {
  ignoreCadence?: boolean;
}): Promise<IngestOutcome> {
  await ensureSourceHealthRows();
  const settings = await getOrCreateJobAlertSettings();
  if (!settings.enabled) {
    return { skipped: true, reason: "disabled" };
  }
  const enabled = await getEnabledSources();
  let repairOnly = false;
  if (
    !opts?.ignoreCadence &&
    cadenceGuardActive(settings.lastSuccessAt, settings.cadenceDays)
  ) {
    const health = await db.jobSourceHealth.findMany();
    const retry = new Set(
      health
        .filter(
          (row) =>
            row.enabled &&
            (row.status === "DOWN" || row.status === "UNCONFIGURED"),
        )
        .map((row) => row.source),
    );
    if (retry.size === 0) {
      return { skipped: true, reason: "cadence" };
    }
    repairOnly = true;
    for (const source of JOB_SOURCES) {
      enabled[source] = enabled[source] && retry.has(source);
    }
  }

  const run = await db.jobAlertRun.create({ data: {} });
  const started = Date.now();

  try {
    const results = await fetchAllSources({
      extraKeywords: settings.defaultKeywords,
      apifyLocation: await topStudentCountry(),
      enabled,
    });

    let jobsStored = 0;
    const newJobIds: string[] = [];
    for (const result of results) {
      const persisted = await persistSourceResult(
        result.source,
        started,
        result,
      );
      jobsStored += persisted.kept;
      newJobIds.push(...persisted.ids);
    }

    await db.scrapedJob.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const { emailsSent, emailsSkip } = repairOnly
      ? { emailsSent: 0, emailsSkip: 0 }
      : await sendWeeklyDigests(
          run.id,
          settings.maxEmailJobs || DEFAULT_EMAIL_JOBS,
          newJobIds,
        );

    await db.jobAlertRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        ok: true,
        jobsStored,
        emailsSent,
        emailsSkip,
      },
    });
    if (!repairOnly) {
      await db.jobAlertSettings.update({
        where: { id: "default" },
        data: { lastSuccessAt: new Date() },
      });
    }
    revalidateTag("job-board", "max");
    return {
      skipped: false,
      jobsStored,
      emailsSent,
      emailsSkip,
      runId: run.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ingest failed";
    await db.jobAlertRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        ok: false,
        error: message,
      },
    });
    throw error;
  }
}
