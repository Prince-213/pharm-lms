import { BookOpen, Presentation, Star, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingHostCard } from "@/components/meetings/meeting-host-card";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentTutorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/tutors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const tutors = await db.user.findMany({
    where: {
      role: UserRole.TUTOR,
      isActive: true,
      tutorProfileCompletedAt: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      mentorSpecialties: true,
      courses: {
        where: { status: CourseStatus.PUBLISHED },
        select: {
          id: true,
          reviews: {
            select: { rating: true },
          },
        },
      },
    },
    take: 60,
  });

  const tutorsWithAvatars = await Promise.all(
    tutors.map(async (t) => ({
      ...t,
      avatarSrc: await resolveMediaUrl(t.avatarUrl),
    })),
  );

  return (
    <div className="space-y-8 text-foreground">
      {/* <StudentSecondaryNav /> */}

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Tutors
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Browse our available tutors. You can book sessions with course instructors for additional guidance.
        </p>
      </header>

      {tutors.length ? (
        <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutorsWithAvatars.map((t) => {
            let totalReviews = 0;
            let sumRatings = 0;
            
            for (const c of t.courses) {
              for (const r of c.reviews) {
                totalReviews++;
                sumRatings += r.rating;
              }
            }
            
            const avgRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : null;
            const courseCount = t.courses.length;

            const rows = [
              {
                icon: Presentation,
                text: `${courseCount} published course${courseCount === 1 ? "" : "s"}`,
              },
            ];
            
            if (avgRating) {
              rows.push({
                icon: Star,
                text: `${avgRating} avg. course rating (${totalReviews} review${totalReviews === 1 ? "" : "s"})`,
              });
            }
            
            if (t.mentorHeadline?.trim()) {
              rows.push({
                icon: User,
                text: t.mentorHeadline.trim(),
              });
            }
            if (t.mentorSpecialties?.trim()) {
              rows.push({
                icon: BookOpen,
                text: t.mentorSpecialties.trim(),
              });
            }
            return (
              <MeetingHostCard
                key={t.id}
                href={`/student/tutors/${t.id}`}
                fullName={t.fullName}
                bio={t.bio}
                fallbackBio="Course instructor — book with course context."
                avatarUrl={t.avatarSrc}
                rows={rows}
                ctaLabel="View profile"
              />
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
          <p>No tutors are available yet.</p>
        </div>
      )}
    </div>
  );
}
