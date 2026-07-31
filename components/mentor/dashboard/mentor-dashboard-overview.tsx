import {
  Calendar,
  CalendarClock,
  Inbox,
  User,
  Video,
} from "@/lib/icons/server";
import Link from "next/link";
import { MeetingRequestStatus, MeetingStatus, MentorProfileStatus } from "@/generated/prisma/enums";
import {
  formatMeetingCrmDate,
  formatMeetingRelativeSchedule,
} from "@/lib/meetings/crm-display";
import { isMeetingJoinable } from "@/lib/meetings/meeting-joinable";
import type { MentorOverviewSnapshot } from "@/lib/mentor/dashboard-overview-data";
import { cn } from "@/lib/utils";

function prettifyStatus(raw: string): string {
  return raw
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function upcomingSessionLabel(status: MeetingStatus, startsAt: Date): string {
  const now = Date.now();
  const starts = new Date(startsAt).getTime();
  if (status === MeetingStatus.COMPLETED) return "Joined";
  if (status === MeetingStatus.EXPIRED) return "Expired";
  if (status === MeetingStatus.CANCELLED) return "Cancelled";
  if (status === MeetingStatus.SCHEDULED && starts > now) return "Upcoming";
  if (status === MeetingStatus.SCHEDULED) return "Scheduled";
  return prettifyStatus(status);
}

type MentorDashboardOverviewProps = {
  mentorFirstName: string;
  mentorProfileStatus: MentorProfileStatus;
  snapshot: MentorOverviewSnapshot;
};

export function MentorDashboardOverview({
  mentorFirstName,
  mentorProfileStatus,
  snapshot,
}: MentorDashboardOverviewProps) {
  const {
    pendingRequestCount,
    upcomingWeekSessionCount,
    availabilitySlotCount,
    availabilitySummaryLine,
    availabilityTimezone,
    upcomingMeetings,
    activity,
  } = snapshot;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-[var(--foreground)] sm:px-6 sm:py-10">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Welcome{mentorFirstName ? `, ${mentorFirstName}` : ""}.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your scheduling snapshot, upcoming sessions, and recent coaching
          activity—manage details anytime on{" "}
          <Link
            href="/mentor/meetings"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Meetings
          </Link>
          .
        </p>
      </header>

      <MentorActivationStatusStrip status={mentorProfileStatus} />

      <section aria-label="Key metrics">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiTile
            icon={Inbox}
            label="Pending requests"
            value={pendingRequestCount}
            hint="Need a response"
          />
          <KpiTile
            icon={CalendarClock}
            label="Sessions this week"
            value={upcomingWeekSessionCount}
            hint="Next 7 days"
          />
          <KpiTile
            icon={Calendar}
            label="Weekly availability"
            value={availabilitySlotCount > 0 ? "On" : "Off"}
            hint={
              availabilitySlotCount > 0
                ? `${availabilitySlotCount} block${availabilitySlotCount === 1 ? "" : "s"}`
                : "Not configured"
            }
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-7">
          <section
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            aria-labelledby="upcoming-sessions-heading"
          >
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2
                  id="upcoming-sessions-heading"
                  className="text-sm font-bold text-[var(--foreground)]"
                >
                  Upcoming sessions
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Next scheduled calls (soonest first).
              </p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {upcomingMeetings.length ? (
                upcomingMeetings.map((m) => {
                  const joinable = isMeetingJoinable(m);
                  const statusChip = upcomingSessionLabel(m.status, m.startsAt);
                  return (
                    <article
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {m.studentName}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[var(--primary)]">
                          {formatMeetingRelativeSchedule(m.startsAt)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatMeetingCrmDate(m.startsAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {statusChip}
                        </span>
                        {joinable ? (
                          <Link
                            href={`/mentor/meetings/join/${m.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)]"
                          >
                            <Video className="h-3.5 w-3.5" aria-hidden />
                            Join
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="px-4 py-12 text-center sm:px-5">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    No upcoming sessions
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    When you accept a booking, the scheduled call appears here.
                  </p>
                  <Link
                    href="/mentor/meetings"
                    className="mt-4 inline-block text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    Open meetings →
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            aria-labelledby="availability-heading"
          >
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <h2
                  id="availability-heading"
                  className="text-sm font-bold text-[var(--foreground)]"
                >
                  Weekly availability
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Summary of saved blocks students see when booking.
              </p>
            </div>
            <div className="space-y-4 px-4 py-5 sm:px-5">
              {availabilitySummaryLine ? (
                <>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {availabilitySummaryLine}
                  </p>
                  {availabilityTimezone ? (
                    <p className="text-xs text-muted-foreground">
                      Timezone: {availabilityTimezone}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You have not set weekly hours yet. Students need your
                  availability before they can pick a slot that fits you.
                </p>
              )}
              <Link
                href="/mentor/meetings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Manage schedule →
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <section
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            aria-labelledby="activity-heading"
          >
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h2
                  id="activity-heading"
                  className="text-sm font-bold text-[var(--foreground)]"
                >
                  Recent activity
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest requests and sessions (newest first).
              </p>
            </div>
            {activity.length ? (
              <ul className="divide-y divide-[var(--border)]">
                {activity.map((row) => (
                  <li key={row.id}>
                    <Link
                      href="/mentor/meetings"
                      className="block px-4 py-3 transition-colors hover:bg-[var(--surface-muted)]/50 sm:px-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {row.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {row.detail}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            row.kind === "request" &&
                              row.statusLabel === MeetingRequestStatus.PENDING
                              ? "bg-amber-100 text-amber-900"
                              : "bg-[var(--surface-muted)] text-muted-foreground",
                          )}
                        >
                          {prettifyStatus(row.statusLabel)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center sm:px-5">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  No activity yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  When a student books you from the coach directory, requests
                  and sessions will show up here.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      <section aria-label="Quick links">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick links
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/mentor/profile"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/30 hover:bg-[var(--surface-muted)]/30 sm:p-5"
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Profile
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bio, contact, and expertise for your public mentor page.
            </p>
          </Link>
          <Link
            href="/mentor/meetings"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/30 hover:bg-[var(--surface-muted)]/30 sm:p-5"
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Meetings
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Availability, booking requests, and join links.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function MentorActivationStatusStrip({
  status,
}: {
  status: MentorProfileStatus;
}) {
  const step =
    status === MentorProfileStatus.APPROVED
      ? 3
      : status === MentorProfileStatus.PENDING_REVIEW
        ? 2
        : 1;

  const headline =
    status === MentorProfileStatus.APPROVED
      ? "You’re live — visible to students"
      : status === MentorProfileStatus.PENDING_REVIEW
        ? "Pending activation"
        : status === MentorProfileStatus.REJECTED
          ? "Updates required before activation"
          : "Complete your profile to get listed";

  const detail =
    status === MentorProfileStatus.APPROVED
      ? "Students can find and book you in the mentor directory."
      : status === MentorProfileStatus.PENDING_REVIEW
        ? "An admin will activate your listing. You can keep using your dashboard in the meantime."
        : status === MentorProfileStatus.REJECTED
          ? "Review the feedback, update your profile, and resubmit for activation."
          : "Fill in required details and submit for admin activation.";

  const steps = [
    { n: 1, label: "Complete profile" },
    { n: 2, label: "Under review" },
    { n: 3, label: "Visible to students" },
  ] as const;

  return (
    <section
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        status === MentorProfileStatus.APPROVED
          ? "border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          : "border-amber-200 bg-amber-50 text-amber-950",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              status === MentorProfileStatus.APPROVED
                ? "text-muted-foreground"
                : "text-amber-800",
            )}
          >
            Listing status
          </p>
          <p className="text-sm font-semibold">{headline}</p>
          <p
            className={cn(
              "text-xs leading-relaxed",
              status === MentorProfileStatus.APPROVED
                ? "text-muted-foreground"
                : "text-amber-900/90",
            )}
          >
            {detail}
          </p>
          {status !== MentorProfileStatus.APPROVED ? (
            <p className="pt-1 text-xs">
              <Link href="/mentor/profile" className="font-semibold underline">
                {status === MentorProfileStatus.PENDING_REVIEW
                  ? "View profile"
                  : status === MentorProfileStatus.REJECTED
                    ? "Update and resubmit"
                    : "Go to profile"}
              </Link>
            </p>
          ) : null}
        </div>

        <ol className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Activation steps">
          {steps.map((s, i) => {
            const done =
              step > s.n ||
              (status === MentorProfileStatus.APPROVED && step >= s.n);
            const current =
              step === s.n && status !== MentorProfileStatus.APPROVED;
            return (
              <li key={s.n} className="flex items-center gap-1 sm:gap-2">
                {i > 0 ? (
                  <span
                    className={cn(
                      "hidden h-px w-4 sm:block sm:w-6",
                      step > s.n - 1 || status === MentorProfileStatus.APPROVED
                        ? "bg-[var(--primary)]"
                        : "bg-amber-300",
                    )}
                    aria-hidden
                  />
                ) : null}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ring-1",
                      done
                        ? "bg-[var(--primary)] text-white ring-[var(--primary)]"
                        : current
                          ? "bg-white text-amber-950 ring-amber-400"
                          : "bg-white/70 text-amber-800/70 ring-amber-200",
                    )}
                  >
                    {done ? "✓" : s.n}
                  </span>
                  <span className="max-w-[4.5rem] text-center text-[10px] font-medium leading-tight sm:max-w-none">
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Inbox;
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-[var(--foreground)] sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/50 p-2 text-muted-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  );
}
