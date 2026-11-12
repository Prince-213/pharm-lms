import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { isJobsBoardLive } from "@/lib/jobs/constants";
import {
  getRankedJobsForStudent,
  loadStudentRankContext,
} from "@/lib/jobs/listing";
import { isStudentProfileComplete } from "@/lib/jobs/profile-complete";
import { getOrCreateJobAlertSettings } from "@/lib/jobs/settings";
import { roleHomePath } from "@/lib/rbac";
import { JobsLockPanel } from "./jobs-lock-panel";
import { JobsPageClient } from "./jobs-page-client";

type SearchParams = {
  onboard?: string;
};

function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default async function StudentJobsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/jobs");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const params = (await searchParams) ?? {};
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      fullName: true,
      country: true,
      city: true,
      jobPreference: true,
    },
  });
  if (!user) redirect("/student/login");

  if (!isStudentProfileComplete(user)) {
    return <JobsLockPanel />;
  }

  const prefs = user.jobPreference ?? {
    roles: [] as string[],
    workStyle: null,
    level: null,
    jobAlertsEnabled: true,
    onboardingStatus: "PENDING" as const,
  };

  const live = isJobsBoardLive();
  const startOnboarding =
    prefs.onboardingStatus === "PENDING" || params.onboard === "1";

  const settings = await getOrCreateJobAlertSettings();
  const cadenceDays = settings.cadenceDays || 7;
  const lastSuccessAt = settings.lastSuccessAt;
  const nextScrapeAt = lastSuccessAt
    ? new Date(lastSuccessAt.getTime() + cadenceDays * 24 * 60 * 60 * 1000)
    : null;

  const jobs = live
    ? await getRankedJobsForStudent(
        await loadStudentRankContext(session.user.id),
      )
    : [];
  const emailed = live
    ? await db.jobAlertDelivery.findMany({
        where: { userId: session.user.id },
        select: { jobId: true, createdAt: true },
      })
    : [];
  const emailedAtByJobId = Object.fromEntries(
    emailed.map((row) => [row.jobId, row.createdAt.toISOString()]),
  );

  return (
    <JobsPageClient
      live={live}
      startOnboarding={startOnboarding}
      cadenceDays={cadenceDays}
      lastSuccessAt={toIso(lastSuccessAt)}
      nextScrapeAt={toIso(nextScrapeAt)}
      prefs={{
        roles: prefs.roles,
        workStyle: prefs.workStyle,
        level: prefs.level,
        jobAlertsEnabled: prefs.jobAlertsEnabled,
        onboardingStatus: prefs.onboardingStatus,
      }}
      jobs={jobs.map((job, rankIndex) => ({
        id: job.id,
        title: job.title,
        snippet: job.snippet,
        location: job.location,
        remote: job.remote,
        company: job.company,
        source: job.source,
        type: job.type,
        salaryText: job.salaryText,
        applyUrl: job.applyUrl,
        postedAt: toIso(job.postedAt),
        createdAt: toIso(job.createdAt) ?? new Date(0).toISOString(),
        rankIndex,
        emailedAt: emailedAtByJobId[job.id] ?? null,
      }))}
    />
  );
}
