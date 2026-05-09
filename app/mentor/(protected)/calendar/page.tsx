import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorMeetingsCalendar } from "@/components/mentor/mentor-meetings-calendar";
import { MentorProfileStatus, MeetingStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorCalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login?callbackUrl=/mentor/calendar");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const mentor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mentorProfileStatus: true },
  });
  if (!mentor) redirect("/mentor/login");
  if (mentor.mentorProfileStatus !== MentorProfileStatus.APPROVED) {
    redirect("/mentor/profile");
  }

  const now = new Date();
  const in90 = new Date(now);
  in90.setDate(now.getDate() + 90);

  const meetings = await db.meeting.findMany({
    where: {
      mentorId: session.user.id,
      startsAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: in90 },
      status: { in: [MeetingStatus.SCHEDULED, MeetingStatus.COMPLETED] },
    },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      startsAt: true,
      status: true,
      joinUrl: true,
      student: { select: { fullName: true } },
    },
    take: 300,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          A calendar view of booked meetings with students.
        </p>
      </div>

      <MentorMeetingsCalendar
        meetings={meetings.map((m) => ({
          id: m.id,
          startsAtIso: m.startsAt.toISOString(),
          status: m.status,
          joinUrl: m.joinUrl,
          studentName: m.student.fullName,
        }))}
      />

      <div className="flex flex-wrap gap-4">
        <Link
          href="/mentor/schedule"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Edit schedule →
        </Link>
        <Link
          href="/mentor/meetings"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Back to meetings →
        </Link>
      </div>
    </div>
  );
}

