import { CalendarClock, Sparkles, Users, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { RouterRefreshInterval } from "@/components/system/router-refresh-interval";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import {
  isMeetingJoinable,
  isMeetingLiveForDashboard,
} from "@/lib/meetings/meeting-joinable";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentMeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/meetings");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  await reconcileStaleMeetingsThrottled();

  const [enrollments, meetingRequests, mentors] = await withDbRetry(() =>
    Promise.all([
      db.enrollment.findMany({
        where: { studentId: session.user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              mentor: { select: { id: true, fullName: true, bio: true } },
            },
          },
        },
      }),
      db.meetingRequest.findMany({
        where: { studentId: session.user.id },
        orderBy: { requestedAt: "desc" },
        include: {
          course: { select: { title: true } },
          mentor: { select: { id: true, fullName: true } },
          meeting: true,
        },
      }),
      db.user.findMany({
        where: {
          role: UserRole.MENTOR,
          mentorProfileStatus: MentorProfileStatus.APPROVED,
        },
        select: {
          id: true,
          fullName: true,
          bio: true,
        },
        orderBy: { fullName: "asc" },
        take: 48,
      }),
    ]),
  );

  const mentorMap = new Map<
    string,
    {
      id: string;
      fullName: string;
      bio: string | null;
      courseIds: Set<string>;
      totalRequests: number;
      pendingRequests: number;
      activeMeetings: number;
    }
  >();

  for (const enrollment of enrollments) {
    const mentor = enrollment.course.mentor;
    const existing = mentorMap.get(mentor.id);
    if (existing) {
      existing.courseIds.add(enrollment.course.id);
      continue;
    }
    mentorMap.set(mentor.id, {
      id: mentor.id,
      fullName: mentor.fullName,
      bio: mentor.bio,
      courseIds: new Set([enrollment.course.id]),
      totalRequests: 0,
      pendingRequests: 0,
      activeMeetings: 0,
    });
  }

  for (const req of meetingRequests) {
    const mentor = mentorMap.get(req.mentor.id);
    if (!mentor) continue;
    mentor.totalRequests += 1;
    if (req.status === "PENDING") mentor.pendingRequests += 1;
    if (req.meeting && isMeetingLiveForDashboard(req.meeting)) {
      mentor.activeMeetings += 1;
    }
  }

  const instructors = Array.from(mentorMap.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
  const activeMeetingsTotal = instructors.reduce(
    (sum, m) => sum + m.activeMeetings,
    0,
  );
  const pendingTotal = meetingRequests.filter(
    (r) => r.status === "PENDING",
  ).length;

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      <RouterRefreshInterval intervalMs={20000} />
      <StudentSecondaryNav />

      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Meetings
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Book your course tutors for class-linked sessions, or mentors for
          independent coaching. Join Jitsi video when a meeting is open.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Instructors
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {instructors.length}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Mentors
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {mentors.length}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Pending
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {pendingTotal}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-center shadow-[var(--shadow-sm)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Active
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {activeMeetingsTotal}
          </p>
        </div>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <Users className="h-5 w-5 text-[var(--muted)]" strokeWidth={1.75} />
          <h2 className="text-base font-semibold">
            Course instructors (tutors)
          </h2>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Tutors from your enrollments. Booking includes your course so they
          know the context.
        </p>
        {instructors.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {instructors.map((row) => (
              <li
                key={row.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{row.fullName}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {row.bio?.trim() || "Profile and booking"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                    {row.courseIds.size} course
                    {row.courseIds.size === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
                  <span>{row.pendingRequests} pending</span>
                  <span>{row.activeMeetings} active</span>
                </div>
                <Link
                  href={`/student/meetings/host/${row.id}?courseId=${Array.from(row.courseIds)[0]}`}
                  className="mt-3 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  View profile & schedule
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-6 text-sm text-[var(--muted)]">
            <p>Enroll in a course to see instructors here.</p>
            <Link
              href="/student/browse"
              className="mt-2 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Browse courses
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <Sparkles
            className="h-5 w-5 text-[var(--muted)]"
            strokeWidth={1.75}
          />
          <h2 className="text-base font-semibold">Mentors (coaching only)</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Approved mentors focus on 1:1 coaching—no course enrollment required.
        </p>
        {mentors.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((c) => (
              <li
                key={c.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <p className="text-sm font-semibold">{c.fullName}</p>
                <p className="mt-1 line-clamp-3 text-xs text-[var(--muted)]">
                  {c.bio?.trim() || "One-on-one mentoring available."}
                </p>
                <Link
                  href={`/student/meetings/host/${c.id}`}
                  className="mt-3 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Profile & book
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No mentors are listed yet.
          </p>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarClock
            className="h-5 w-5 text-[var(--muted)]"
            strokeWidth={1.75}
          />
          <h2 className="text-base font-semibold">Activity</h2>
        </div>
        {meetingRequests.length ? (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] md:block">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--background)] text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-2.5">Context</th>
                    <th className="px-3 py-2.5">Host</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {meetingRequests.map((req) => {
                    const meeting = req.meeting;
                    const now = Date.now();
                    const startsAt = meeting?.startsAt
                      ? new Date(meeting.startsAt).getTime()
                      : null;
                    const status = !meeting
                      ? req.status === "PENDING"
                        ? "Pending"
                        : req.status === "REJECTED"
                          ? "Rejected"
                          : "Requested"
                      : meeting.status === "EXPIRED"
                        ? "Expired"
                        : meeting.status === "COMPLETED"
                          ? "Joined"
                          : meeting.status === "CANCELLED"
                            ? "Cancelled"
                            : meeting.status === "SCHEDULED" &&
                                startsAt &&
                                startsAt > now
                              ? "Upcoming"
                              : meeting.status === "SCHEDULED" &&
                                  isMeetingLiveForDashboard(meeting)
                                ? "Active"
                                : "Ended";
                    return (
                      <tr key={req.id} className="bg-[var(--surface)]">
                        <td className="px-3 py-2.5 font-medium">
                          {req.course?.title ?? "Coach session"}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-[var(--muted)]">
                          {req.mentor.fullName}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {meeting?.joinUrl && isMeetingJoinable(meeting) ? (
                            <Link
                              href={`/student/meetings/join/${meeting.id}`}
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary-foreground)]"
                            >
                              <Video className="h-3 w-3" />
                              Join
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2 md:hidden">
              {meetingRequests.map((req) => {
                const meeting = req.meeting;
                const now = Date.now();
                const startsAt = meeting?.startsAt
                  ? new Date(meeting.startsAt).getTime()
                  : null;
                const status = !meeting
                  ? req.status === "PENDING"
                    ? "Pending"
                    : req.status === "REJECTED"
                      ? "Rejected"
                      : "Requested"
                  : meeting.status === "EXPIRED"
                    ? "Expired"
                    : meeting.status === "COMPLETED"
                      ? "Joined"
                      : meeting.status === "CANCELLED"
                        ? "Cancelled"
                        : meeting.status === "SCHEDULED" &&
                            startsAt &&
                            startsAt > now
                          ? "Upcoming"
                          : meeting.status === "SCHEDULED" &&
                              isMeetingLiveForDashboard(meeting)
                            ? "Active"
                            : "Ended";
                return (
                  <li
                    key={req.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                  >
                    <p className="font-semibold">
                      {req.course?.title ?? "Coach session"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {req.mentor.fullName}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
                      {status}
                    </p>
                    {meeting?.joinUrl && isMeetingJoinable(meeting) ? (
                      <Link
                        href={`/student/meetings/join/${meeting.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join meeting
                      </Link>
                    ) : meeting?.startsAt ? (
                      <p className="mt-2 text-[11px] text-[var(--muted)]">
                        {new Date(meeting.startsAt).toLocaleString()}
                      </p>
                    ) : req.preferredTime ? (
                      <p className="mt-2 text-[11px] text-[var(--muted)]">
                        Requested:{" "}
                        {new Date(req.preferredTime).toLocaleString()}
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] text-[var(--muted)]">
                        Waiting for host.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center py-8 text-center text-sm text-[var(--muted)]">
            <CalendarClock className="h-8 w-8 text-[var(--border)]" />
            <p className="mt-3">No meeting activity yet.</p>
          </div>
        )}
      </section>

      <div>
        <Link
          href="/student/dashboard"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Back to My learning
        </Link>
      </div>
    </div>
  );
}
