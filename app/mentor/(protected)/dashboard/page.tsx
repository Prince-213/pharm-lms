import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { Calendar, Clock, MessageSquare, Users } from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { MentorProfileStatus, MeetingRequestStatus, MeetingStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mentorProfileStatus: true },
  });
  if (!user) redirect("/mentor/login");
  if (user.mentorProfileStatus !== MentorProfileStatus.APPROVED) {
    redirect("/mentor/profile");
  }

  const [pendingRequests, upcomingMeetings, availabilitySlots] =
    await Promise.all([
      db.meetingRequest.count({
        where: {
          mentorId: session.user.id,
          courseId: null,
          status: MeetingRequestStatus.PENDING,
        },
      }),
      db.meeting.count({
        where: {
          mentorId: session.user.id,
          status: MeetingStatus.SCHEDULED,
          startsAt: { gte: new Date() },
        },
      }),
      db.mentorAvailability.count({
        where: { mentorId: session.user.id, isRecurring: true },
      }),
    ]);

  return (
    <div className="space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          Mentor dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Overview of your meetings, availability, and messages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          label="Pending requests"
          value={pendingRequests}
          hint="Students awaiting a response"
          icon={Users}
          href="/mentor/meetings"
        />
        <AdminStatCard
          label="Upcoming meetings"
          value={upcomingMeetings}
          hint="Scheduled sessions"
          icon={Calendar}
          href="/mentor/calendar"
        />
        <AdminStatCard
          label="Availability slots"
          value={availabilitySlots}
          hint="Recurring weekly template"
          icon={Clock}
          href="/mentor/schedule"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/mentor/messages"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Messages
            </p>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Reply to students and admins in one inbox.
          </p>
        </Link>
        <Link
          href="/mentor/profile"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Profile
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Edit your bio and photo. Approval status is managed by admin.
          </p>
        </Link>
      </div>
    </div>
  );
}
