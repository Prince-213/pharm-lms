import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingsCrmClient } from "@/components/meetings/meetings-crm-client";
import { MentorMeetingsAvailabilityCallout } from "@/components/mentor/mentor-meetings-availability";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { mentorVisibleToStudents } from "@/lib/auth/mentor-profile-visibility";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import {
  availableWeekdaysFromAvailability,
  buildHostCalendarEvents,
} from "@/lib/meetings/calendar-events";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorMeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login?callbackUrl=/mentor/meetings");
  if (session.user.role !== UserRole.MENTOR)
    redirect(roleHomePath(session.user.role));

  const mentor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mentorProfileStatus: true, fullName: true },
  });
  if (!mentor) redirect("/mentor/login");

  await reconcileStaleMeetingsThrottled();

  const [requests, meetings, availability] = await withDbRetry(async () => {
    const requests = await db.meetingRequest.findMany({
      where: { mentorId: session.user.id, courseId: null },
      orderBy: { requestedAt: "desc" },
      include: {
        student: { select: { fullName: true, email: true } },
      },
      take: 50,
    });
    const meetings = await db.meeting.findMany({
      where: { mentorId: session.user.id },
      orderBy: { startsAt: "desc" },
      include: {
        student: { select: { fullName: true } },
        meetingRequest: {
          select: { requestedAt: true, course: { select: { title: true } } },
        },
      },
      take: 50,
    });
    const availability = await db.mentorAvailability.findMany({
      where: { mentorId: session.user.id, isRecurring: true },
      select: { dayOfWeek: true },
    });
    return [requests, meetings, availability] as const;
  });

  const nowMs = Date.now();
  const calendarEvents = buildHostCalendarEvents(
    requests.map((r) => ({
      ...r,
      studentId: r.studentId,
      course: null,
      student: { fullName: r.student.fullName, email: r.student.email },
    })),
    meetings,
    new Map(),
    "/mentor/meetings/join",
    nowMs,
  );
  const availableWeekdays =
    availableWeekdaysFromAvailability(availability);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your weekly schedule, respond to coaching requests, and join Jitsi
          sessions.
        </p>
      </div>

      {!mentorVisibleToStudents(mentor.mentorProfileStatus) ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Profile not listed for students yet</p>
          <p className="mt-1 text-xs">
            {mentor.mentorProfileStatus === MentorProfileStatus.PENDING_REVIEW
              ? "Your profile is under admin review. You can still manage meetings here."
              : "Complete and submit your profile so students can find and book you."}
          </p>
          <p className="mt-2 text-xs">
            <Link href="/mentor/profile" className="font-semibold underline">
              Go to profile
            </Link>
          </p>
        </section>
      ) : null}

      <MentorMeetingsAvailabilityCallout />

      <section>
        <p className="mb-3 text-sm text-muted-foreground">
          Click a day or event to review coaching requests, accept bookings, or
          join a session.
        </p>
        {calendarEvents.length > 0 ? (
          <MeetingsCrmClient
            events={calendarEvents}
            role="host"
            availableWeekdays={availableWeekdays}
          />
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-[var(--foreground)]">
              No meeting activity yet
            </p>
            <p className="mt-1 text-xs">
              When a student books you from the coach directory, requests appear
              on the calendar.
            </p>
          </div>
        )}
      </section>

      <div>
        <Link
          href="/mentor/dashboard"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Back to dashboard →
        </Link>
      </div>
    </div>
  );
}
