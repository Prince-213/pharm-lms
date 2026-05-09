import { CalendarClock, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { UserRole } from "@/generated/prisma/enums";
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

  const [enrollments, meetingRequests] = await withDbRetry(() =>
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

  const mentors = Array.from(mentorMap.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
  const activeMeetingsTotal = mentors.reduce(
    (sum, m) => sum + m.activeMeetings,
    0,
  );

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Book with your course mentors, join instant sessions, and track
          upcoming meetings.
        </p>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Mentor CRM</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 font-semibold text-[var(--muted)]">
              Mentors: {mentors.length}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 font-semibold text-[var(--muted)]">
              Pending requests:{" "}
              {meetingRequests.filter((req) => req.status === "PENDING").length}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 font-semibold text-[var(--muted)]">
              Active meetings: {activeMeetingsTotal}
            </span>
          </div>
        </div>
        {mentors.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {mentors.map((mentor) => (
              <li
                key={mentor.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {mentor.fullName}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {mentor.bio?.trim() || "Mentor profile available."}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                    {mentor.courseIds.size} course
                    {mentor.courseIds.size === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-md border border-[var(--border)] px-2 py-1.5">
                    <p className="font-bold text-[var(--foreground)]">
                      {mentor.totalRequests}
                    </p>
                    <p className="text-[var(--muted)]">Requests</p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] px-2 py-1.5">
                    <p className="font-bold text-[var(--foreground)]">
                      {mentor.pendingRequests}
                    </p>
                    <p className="text-[var(--muted)]">Pending</p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] px-2 py-1.5">
                    <p className="font-bold text-[var(--foreground)]">
                      {mentor.activeMeetings}
                    </p>
                    <p className="text-[var(--muted)]">Active</p>
                  </div>
                </div>
                <Link
                  href={`/student/meetings/mentor/${mentor.id}?courseId=${Array.from(mentor.courseIds)[0]}`}
                  className="mt-3 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Open mentor profile & schedule →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Enroll in a course to unlock mentor scheduling.
            </p>
            <Link
              href="/student/browse"
              className="mt-2 inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Browse available courses →
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-semibold">Meeting timeline</h2>
        {meetingRequests.length ? (
          <ul className="mt-4 space-y-3">
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
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {req.course?.title ?? "Mentor session"}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Mentor: {req.mentor.fullName}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold">
                      {status}
                    </span>
                  </div>
                  {meeting?.joinUrl && isMeetingJoinable(meeting) ? (
                    <a
                      href={`/student/meetings/join/${meeting.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)]"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Enter meeting
                    </a>
                  ) : meeting?.startsAt ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      Scheduled for {new Date(meeting.startsAt).toLocaleString()}
                    </p>
                  ) : req.preferredTime ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      Requested window: {new Date(req.preferredTime).toLocaleString()}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      Waiting for mentor response.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            <div className="mx-auto w-fit rounded-full bg-[var(--primary-soft)] p-3">
              <CalendarClock className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <p className="mt-2">No meeting requests yet.</p>
          </div>
        )}
      </section>

      <div>
        <Link
          href="/student/dashboard"
          className="text-sm font-bold text-[var(--primary)] hover:underline"
        >
          Back to My learning →
        </Link>
      </div>
    </div>
  );
}
