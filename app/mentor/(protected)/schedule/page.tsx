import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";
import { MENTOR_DAY_LABELS } from "@/lib/meetings/mentor-availability-helpers";
import { MentorMeetingsAvailabilityCallout } from "@/components/mentor/mentor-meetings-availability";

export default async function MentorSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login?callbackUrl=/mentor/schedule");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const mentor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { mentorProfileStatus: true },
  });
  if (!mentor) redirect("/mentor/login");
  if (mentor.mentorProfileStatus !== MentorProfileStatus.APPROVED) {
    redirect("/mentor/profile");
  }

  const slots = await db.mentorAvailability.findMany({
    where: { mentorId: session.user.id, isRecurring: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Schedule
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Set and update your weekly availability. Students use this to request
          meetings.
        </p>
      </div>

      <MentorMeetingsAvailabilityCallout />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Current weekly template</h2>
        {slots.length ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {slots.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"
              >
                <p className="font-semibold">{MENTOR_DAY_LABELS[s.dayOfWeek]}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {s.startTime} – {s.endTime} · {s.timezone}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No weekly hours saved yet. Configure your availability above.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/mentor/calendar"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          View calendar →
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

