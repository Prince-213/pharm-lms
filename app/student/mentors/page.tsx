import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";

export default async function StudentMentorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/mentors");
  if (session.user.role !== UserRole.STUDENT) redirect(roleHomePath(session.user.role));

  const mentors = await db.user.findMany({
    where: {
      role: UserRole.MENTOR,
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, fullName: true, bio: true, avatarUrl: true },
    take: 60,
  });

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <StudentSecondaryNav />

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Mentors
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Browse approved mentors and book a 1-on-1 session.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.length ? (
          mentors.map((m) => (
            <Link
              key={m.id}
              href={`/student/mentors/${m.id}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-muted)]">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.fullName}</p>
                  <p className="mt-1 line-clamp-3 text-xs text-[var(--muted)]">
                    {m.bio?.trim() || "Mentor profile available."}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-[var(--primary)]">
                View & book →
              </p>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
            No mentors are available yet.
          </div>
        )}
      </section>
    </div>
  );
}

