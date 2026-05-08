import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          Mentor dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your profile and meeting availability.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/mentor/profile"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Profile
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Update your bio and photo.
          </p>
        </Link>
        <Link
          href="/mentor/meetings"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Meetings
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Set your weekly availability and manage bookings.
          </p>
        </Link>
      </div>
    </div>
  );
}

