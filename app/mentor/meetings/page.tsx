import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";
import { MentorMeetingsAvailabilityCallout } from "@/components/mentor/mentor-meetings-availability";

export default async function MentorMeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login?callbackUrl=/mentor/meetings");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const mentor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mentorProfileStatus: true, fullName: true },
  });
  if (!mentor) redirect("/mentor/login");
  if (mentor.mentorProfileStatus !== MentorProfileStatus.APPROVED) {
    redirect("/mentor/profile");
  }

  const requests = await db.meetingRequest.findMany({
    where: { mentorId: session.user.id, courseId: null },
    orderBy: { requestedAt: "desc" },
    include: { student: { select: { fullName: true } }, meeting: true },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Set your weekly schedule and review student bookings.
        </p>
      </div>

      <MentorMeetingsAvailabilityCallout />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Booking requests</h2>
        {requests.length ? (
          <ul className="mt-4 space-y-3">
            {requests.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{r.student.fullName}</p>
                    <p className="text-xs text-[var(--muted)]">
                      Requested: {r.requestedAt.toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                    {r.status}
                  </span>
                </div>
                {r.meeting ? (
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Scheduled for {new Date(r.meeting.startsAt).toLocaleString()}
                  </p>
                ) : r.preferredTime ? (
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Preferred time: {new Date(r.preferredTime).toLocaleString()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">No requests yet.</p>
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

