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
