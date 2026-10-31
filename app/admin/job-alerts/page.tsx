import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { isApifyConfigured, type JobSourceId } from "@/lib/jobs/constants";
import {
  cadenceGuardActive,
  ensureSourceHealthRows,
  getOrCreateJobAlertSettings,
} from "@/lib/jobs/settings";
import { JobAlertsSettingsForm } from "./job-alerts-settings-form";
import { JobSourceTable } from "./job-source-table";

function formatWhen(value: Date | null | undefined) {
  if (!value) return "—";
  return value.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminJobAlertsPage() {
  await requireAdminSession();
  await ensureSourceHealthRows();
  const settings = await getOrCreateJobAlertSettings();

  const [jobCount, lastRun, sources] = await Promise.all([
    db.scrapedJob.count({ where: { expiresAt: { gt: new Date() } } }),
    db.jobAlertRun.findFirst({ orderBy: { startedAt: "desc" } }),
    db.jobSourceHealth.findMany({ orderBy: { source: "asc" } }),
  ]);

  const nextScrape = settings.lastSuccessAt
    ? new Date(
        settings.lastSuccessAt.getTime() +
          settings.cadenceDays * 24 * 60 * 60 * 1000,
      )
    : null;
  const needsRepair = sources.some(
    (row) =>
      row.enabled &&
      (row.status === "DOWN" || row.status === "UNCONFIGURED") &&
      !(row.source === "apify" && !isApifyConfigured()),
  );
  const cadenceBlocked =
    cadenceGuardActive(settings.lastSuccessAt, settings.cadenceDays) &&
    !needsRepair;

  function sourceStatus(row: (typeof sources)[number]) {
    if (row.source === "apify" && !isApifyConfigured()) return "unconfigured";
    if (
      row.source === "apify" &&
      isApifyConfigured() &&
      row.status === "UNCONFIGURED"
    ) {
      return "ready";
    }
    return row.status.toLowerCase();
  }

  return (
    <>
      <AdminPageHeader
        title="Job alerts"
        description="Weekly cache ingest, source health, and the student digest. Listings never call the APIs live."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Emailed last run"
          value={lastRun?.emailsSent ?? 0}
          hint="Active students who received a digest"
        />
        <AdminStatCard
          label="Stored jobs"
          value={jobCount}
          hint="Unexpired rows in cache"
        />
        <AdminStatCard
          label="Last scrape"
          value={formatWhen(settings.lastSuccessAt)}
          hint={
            lastRun?.ok === false
              ? "Last run reported an error"
              : "Successful ingest"
          }
        />
        <AdminStatCard
          label="Next scrape"
          value={formatWhen(nextScrape)}
          hint={`${lastRun?.emailsSkip ?? 0} skipped last run`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel
          title="Sources"
          description="Eight keyless feeds plus an optional hard-capped Apify run."
        >
          <JobSourceTable
            rows={sources.map((row) => ({
              id: row.id,
              source: row.source,
              enabled: row.enabled,
              statusLabel: sourceStatus(row),
              lastMs: row.lastMs,
              jobsKept: row.jobsKept,
              lastError: row.lastError,
            }))}
          />
        </AdminPanel>

        <AdminPanel
          title="Settings"
          description="Cadence guard still applies to Run now so Apify cannot fire twice in a window."
        >
          <JobAlertsSettingsForm
            enabled={settings.enabled}
            cadenceDays={settings.cadenceDays}
            maxEmailJobs={settings.maxEmailJobs}
            defaultKeywords={settings.defaultKeywords}
            cadenceBlocked={cadenceBlocked}
            sources={sources.map((row) => ({
              source: row.source as JobSourceId,
              enabled: row.enabled,
            }))}
          />
        </AdminPanel>
      </div>
    </>
  );
}
