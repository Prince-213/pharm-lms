import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email-service";
import { createNotifications } from "@/lib/notifications/notification-service";

function appBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  ).replace(/\/$/, "");
}

export type JobAlertBatchSummary = {
  runId: string;
  jobsStored: number;
  emailsSent: number;
  emailsSkip: number;
  emailsMocked: number;
  repairOnly: boolean;
  cadenceDays: number;
  lastSuccessAt: Date | null;
  sourceCount: number;
};

export async function notifyAdminsJobAlertBatchComplete(
  summary: JobAlertBatchSummary,
) {
  const admins = await db.user.findMany({
    where: { role: UserRole.ADMIN, isActive: true },
    select: { id: true, email: true, fullName: true },
    take: 25,
  });
  if (admins.length === 0) return;

  const href = "/admin/job-alerts";
  const base = appBaseUrl();
  const link = base ? `${base}${href}` : href;
  const nextScrape =
    summary.lastSuccessAt && !summary.repairOnly
      ? new Date(
          summary.lastSuccessAt.getTime() +
            summary.cadenceDays * 24 * 60 * 60 * 1000,
        )
      : null;

  const mode = summary.repairOnly ? "Repair scrape" : "Weekly ingest";
  const mockNote =
    summary.emailsMocked > 0
      ? ` Warning: ${summary.emailsMocked} digest(s) were MOCKED (RESEND_API_KEY missing).`
      : "";

  const title = `${mode} finished`;
  const body = `${summary.jobsStored} jobs stored · ${summary.emailsSent} emailed · ${summary.emailsSkip} skipped · ${summary.sourceCount} sources.${mockNote}`;

  await createNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      kind: "JOB_ALERT_BATCH",
      title,
      body: body.trim(),
      href,
    })),
  );

  const nextLine = nextScrape
    ? `<p>Next scheduled window (approx): <strong>${nextScrape.toUTCString()}</strong> (cadence ${summary.cadenceDays}d).</p>`
    : summary.repairOnly
      ? `<p>Repair-only run — student digests were not sent; cadence unchanged.</p>`
      : "";

  const mockHtml =
    summary.emailsMocked > 0
      ? `<p style="color:#b45309"><strong>MOCKED EMAILS:</strong> ${summary.emailsMocked} digest(s) logged as sent without Resend. Set <code>RESEND_API_KEY</code> on the server.</p>`
      : "";

  await Promise.allSettled(
    admins.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: `PharmEdge job alerts: ${mode.toLowerCase()}`,
        html: `<p>Hi ${admin.fullName.split(/\s+/)[0] || admin.fullName},</p>
<p><strong>${mode}</strong> completed (run <code>${summary.runId}</code>).</p>
<ul>
  <li>Jobs stored / refreshed: <strong>${summary.jobsStored}</strong></li>
  <li>Student digests sent: <strong>${summary.emailsSent}</strong></li>
  <li>Students skipped: <strong>${summary.emailsSkip}</strong></li>
  <li>Sources in this run: <strong>${summary.sourceCount}</strong></li>
</ul>
${mockHtml}
${nextLine}
<p><a href="${link}">Open job alerts admin</a></p>`,
      }),
    ),
  );
}
