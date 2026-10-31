import { db } from "@/lib/db";
import {
  isApifyConfigured,
  JOB_SOURCES,
  type JobSourceId,
} from "@/lib/jobs/constants";

export async function getOrCreateJobAlertSettings() {
  return db.jobAlertSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}

export async function ensureSourceHealthRows() {
  const apifyReady = isApifyConfigured();
  await db.jobSourceHealth.deleteMany({
    where: { source: { notIn: [...JOB_SOURCES] } },
  });
  await Promise.all(
    JOB_SOURCES.map(async (source) => {
      const existing = await db.jobSourceHealth.findUnique({
        where: { source },
      });
      if (!existing) {
        await db.jobSourceHealth.create({
          data: {
            source,
            enabled: true,
            status:
              source === "apify" && !apifyReady ? "UNCONFIGURED" : "HEALTHY",
          },
        });
        return;
      }
      if (source !== "apify") return;
      if (!apifyReady && existing.status !== "UNCONFIGURED") {
        await db.jobSourceHealth.update({
          where: { source },
          data: { status: "UNCONFIGURED", lastError: "unconfigured" },
        });
        return;
      }
      if (apifyReady && existing.status === "UNCONFIGURED") {
        await db.jobSourceHealth.update({
          where: { source },
          data: { lastError: null },
        });
      }
    }),
  );
}

export async function getEnabledSources(): Promise<
  Record<JobSourceId, boolean>
> {
  await ensureSourceHealthRows();
  const rows = await db.jobSourceHealth.findMany();
  const map = Object.fromEntries(JOB_SOURCES.map((s) => [s, true])) as Record<
    JobSourceId,
    boolean
  >;
  for (const row of rows) {
    if (row.source in map) {
      map[row.source as JobSourceId] = row.enabled;
    }
  }
  return map;
}

export function cadenceGuardActive(
  lastSuccessAt: Date | null | undefined,
  cadenceDays: number,
  now = new Date(),
): boolean {
  if (!lastSuccessAt) return false;
  const next = lastSuccessAt.getTime() + cadenceDays * 24 * 60 * 60 * 1000;
  return now.getTime() < next;
}
