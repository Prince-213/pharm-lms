import { siteUrl } from "@/lib/site-metadata";

export type DigestJob = {
  title: string;
  company: string | null;
  location: string | null;
  applyUrl: string;
  source: string;
  sourceUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function getJobAlertDigestTemplate(opts: {
  studentName: string;
  rolesLabel: string;
  jobs: DigestJob[];
  kind?: "weekly" | "welcome";
}) {
  const name = escapeHtml(opts.studentName || "there");
  const roles = escapeHtml(opts.rolesLabel);
  const boardUrl = `${siteUrl}/student/jobs`;
  const unsubUrl = `${siteUrl}/student/jobs/unsubscribe`;
  const count = opts.jobs.length;
  const headline =
    opts.kind === "welcome" ? "Your first matches" : "Weekly role digest";
  const intro =
    opts.kind === "welcome"
      ? `${count} opening${count === 1 ? "" : "s"} from this week's cache that match your ${roles} pathway.`
      : `${count} opening${count === 1 ? "" : "s"} that match your ${roles} pathway after the latest scrape.`;

  const rows = opts.jobs
    .map((job) => {
      const company = job.company ? escapeHtml(job.company) : "Company hidden";
      const location = job.location
        ? escapeHtml(job.location)
        : "Location varies";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#000080;">${escapeHtml(job.title)}</p>
            <p style="margin:0 0 8px;font-size:13px;color:#475569;">${company} · ${location}</p>
            <a href="${escapeHtml(job.applyUrl)}" style="color:#00BFFF;font-size:13px;font-weight:600;">View opening</a>
            <span style="color:#94a3b8;font-size:12px;"> · via <a href="${escapeHtml(job.sourceUrl)}" style="color:#64748b;">${escapeHtml(job.source)}</a></span>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#0f172a;background:#ffffff;">
      <div style="background:#000080;color:#ffffff;padding:20px 24px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#00BFFF;">PharmEdge</p>
        <h1 style="margin:8px 0 0;font-size:22px;">${headline}</h1>
      </div>
      <div style="padding:24px;">
        <p>Hi ${name},</p>
        <p>${intro}</p>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <p style="margin:28px 0 0;">
          <a href="${boardUrl}" style="display:inline-block;background:#00BFFF;color:#000080;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:700;">See all matches</a>
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#64748b;">
          Prefer fewer emails? <a href="${unsubUrl}" style="color:#64748b;">Unsubscribe from job alerts</a>.
        </p>
      </div>
    </div>
  `;
}
