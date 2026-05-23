import { BookOpen, Sparkles, User } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingHostCard } from "@/components/meetings/meeting-host-card";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentMentorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/mentors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const mentors = await db.user.findMany({
    where: {
      role: UserRole.MENTOR,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      mentorSpecialties: true,
    },
    take: 60,
  });

  const mentorsWithAvatars = await Promise.all(
    mentors.map(async (m) => ({
      ...m,
      avatarSrc: await resolveMediaUrl(m.avatarUrl),
    })),
  );

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      {/* <StudentSecondaryNav /> */}

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Mentors
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Browse mentors and book a 1-on-1 coaching session (no course
          enrollment required).
        </p>
      </header>

      {mentors.length ? (
        <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentorsWithAvatars.map((m) => {
            const rows = [
              {
                icon: Sparkles,
                text: "Independent coaching — no course enrollment required",
              },
            ];
            if (m.mentorHeadline?.trim()) {
              rows.push({
                icon: User,
                text: m.mentorHeadline.trim(),
              });
            }
            if (m.mentorSpecialties?.trim()) {
              rows.push({
                icon: BookOpen,
                text: m.mentorSpecialties.trim(),
              });
            }
            return (
              <MeetingHostCard
                key={m.id}
                href={`/student/mentors/${m.id}`}
                fullName={m.fullName}
                bio={m.bio}
                fallbackBio="One-on-one mentoring available."
                avatarUrl={m.avatarSrc}
                rows={rows}
                ctaLabel="View profile"
              />
            );
          })}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No mentors are available yet.
        </div>
      )}
    </div>
  );
}
