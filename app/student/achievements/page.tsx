import { Award, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BadgeToastTrigger } from "@/components/student/badge-toast-trigger";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { UserRole } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { describeRuleConfig } from "@/lib/badges/rule-definitions";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentAchievementsPage() {
  const session = await auth();
  if (!session?.user)
    redirect("/student/login?callbackUrl=/student/achievements");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { awarded: newBadges } = await evaluateStudentBadges(session.user.id);

  const [allBadges, awarded] = await Promise.all([
    db.badge.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        ruleType: true,
        ruleConfig: true,
        iconUrl: true,
      },
    }),
    db.studentBadge.findMany({
      where: { studentId: session.user.id },
      orderBy: { awardedAt: "desc" },
      select: { badgeId: true, awardedAt: true },
    }),
  ]);

  const awardedMap = new Map(awarded.map((a) => [a.badgeId, a.awardedAt]));
  const unlocked = allBadges.filter((b) => awardedMap.has(b.id));
  const locked = allBadges.filter((b) => !awardedMap.has(b.id));

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      <BadgeToastTrigger newBadges={newBadges} />
      {/* <StudentSecondaryNav /> */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Badges & achievements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recognition for milestones like enrollments, lessons completed, and
          quiz attempts. Badges are awarded automatically as you study.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Earned ({unlocked.length})
        </h2>
        {unlocked.length === 0 ? (
          <div className="mt-3 flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center shadow-[var(--shadow-sm)]">
            <Award
              className="h-10 w-10 text-[var(--border)]"
              strokeWidth={1.25}
            />
            <p className="mt-3 text-sm font-semibold">No badges yet</p>
            <p className="mt-2 max-w-md text-xs text-muted-foreground">
              Enroll in a course to earn your first trophy.
            </p>
            <Link
              href="/student/browse"
              className="mt-4 text-sm font-bold text-[var(--primary)] hover:underline"
            >
              Browse courses →
            </Link>
          </div>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((b) => (
              <li
                key={b.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start gap-3">
                  {b.iconUrl ? (
                    <Image
                      src={b.iconUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                      <Award className="h-5 w-5" strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold">{b.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.description}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Awarded {awardedMap.get(b.id)?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {locked.length > 0 ? (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Still to earn ({locked.length})
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((b) => (
              <li
                key={b.id}
                className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 opacity-80"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[var(--surface-muted)] p-2 text-muted-foreground">
                    <Lock className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--foreground)]">
                      {b.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.description}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Goal: {describeRuleConfig(b.ruleType, b.ruleConfig)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
