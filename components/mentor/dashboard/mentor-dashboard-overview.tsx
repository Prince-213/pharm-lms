import {
  Calendar,
  CalendarClock,
  Inbox,
  User,
  Video,
} from "@/lib/icons/server";
import Link from "next/link";
import { MeetingRequestStatus, MeetingStatus, MentorProfileStatus } from "@/generated/prisma/enums";
import { mentorVisibleToStudents } from "@/lib/auth/mentor-profile-visibility";
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

  const visibleToStudents = mentorVisibleToStudents(mentorProfileStatus);

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

      {!visibleToStudents ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Profile verification
          </p>
          <p className="mt-1 font-semibold">
            {mentorProfileStatus === MentorProfileStatus.PENDING_REVIEW
              ? "Pending admin review"
              : mentorProfileStatus === MentorProfileStatus.REJECTED
                ? "Profile needs updates"
                : "Not visible to students yet"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
            {mentorProfileStatus === MentorProfileStatus.PENDING_REVIEW
              ? "Your profile is under review. You can use your dashboard while an admin verifies your listing."
              : mentorProfileStatus === MentorProfileStatus.REJECTED
                ? "An admin asked for changes. Update your profile and submit again for student listing."
                : "Complete and submit your mentor profile so students can find you in the directory."}
          </p>
          <p className="mt-3 text-xs">
            <Link href="/mentor/profile" className="font-semibold underline">
              Go to profile
            </Link>
          </p>
        </section>
      ) : (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Profile verification
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            Approved — visible to students
          </p>
        </section>
      )}

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
