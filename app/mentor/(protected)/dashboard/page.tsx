import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, fullName: true },
  });
  if (!user) redirect("/mentor/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          Welcome{user.fullName?.trim() ? `, ${user.fullName.split(/\s+/)[0]}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your profile, availability, and meeting requests.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Account status
        </p>
        <p className="mt-1 text-sm font-semibold">
          {user.isActive ? "Active (visible to students)" : "Pending activation"}
        </p>
        {!user.isActive ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Complete and submit your profile to become visible to students.
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/mentor/profile"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Profile
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Update your bio, contact info, and expertise.
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
