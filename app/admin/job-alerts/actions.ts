"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { JOB_SOURCES, type JobSourceId } from "@/lib/jobs/constants";
import { runJobAlertIngest } from "@/lib/jobs/ingest";
import {
  ensureSourceHealthRows,
  getOrCreateJobAlertSettings,
} from "@/lib/jobs/settings";

export async function updateJobAlertSettingsAction(formData: FormData) {
  await requireAdminSession();
  await ensureSourceHealthRows();
  await getOrCreateJobAlertSettings();

  const enabled = formData.get("enabled") === "on";
  const cadenceDays = Math.max(
    1,
    Number(formData.get("cadenceDays") ?? 7) || 7,
  );
  const maxEmailJobs = Math.max(
    1,
    Number(formData.get("maxEmailJobs") ?? 5) || 5,
  );
  const defaultKeywords = String(formData.get("defaultKeywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 8);

  await db.jobAlertSettings.update({
    where: { id: "default" },
    data: { enabled, cadenceDays, maxEmailJobs, defaultKeywords },
  });

  for (const source of JOB_SOURCES) {
    const key = `source_${source}`;
    await db.jobSourceHealth.update({
      where: { source },
      data: { enabled: formData.get(key) === "on" },
    });
  }

  revalidatePath("/admin/job-alerts");
  return { ok: true as const };
}

export async function runJobAlertsNowAction() {
  await requireAdminSession();
  const result = await runJobAlertIngest();
  revalidatePath("/admin/job-alerts");
  return result;
}

export async function toggleApifyAction(enabled: boolean) {
  await requireAdminSession();
  await ensureSourceHealthRows();
  await db.jobSourceHealth.update({
    where: { source: "apify" satisfies JobSourceId },
    data: { enabled },
  });
  revalidatePath("/admin/job-alerts");
}

export type AdminSourceJob = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  postedAt: string | null;
  applyUrl: string;
  remote: boolean;
};

const JOB_SOURCE_SET = new Set<string>(JOB_SOURCES);

export async function listScrapedJobsForSourceAction(
  source: string,
): Promise<
  { ok: true; jobs: AdminSourceJob[] } | { ok: false; error: string }
> {
  await requireAdminSession();
  if (!JOB_SOURCE_SET.has(source)) {
    return { ok: false, error: "Unknown job source." };
  }

  try {
    const rows = await db.scrapedJob.findMany({
      where: { source, expiresAt: { gt: new Date() } },
      orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        postedAt: true,
        applyUrl: true,
        remote: true,
      },
    });
    return {
      ok: true,
      jobs: rows.map((row) => ({
        id: row.id,
        title: row.title,
        company: row.company,
        location: row.location,
        postedAt: row.postedAt ? row.postedAt.toISOString() : null,
        applyUrl: row.applyUrl,
        remote: row.remote,
      })),
    };
  } catch {
    return { ok: false, error: "Could not load cached jobs for this source." };
  }
}
