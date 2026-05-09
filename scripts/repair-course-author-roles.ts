/**
 * Ensures every user referenced as Course.mentorId has role TUTOR (course creator).
 * Community mentors (UserRole.MENTOR) should not own catalog courses; if they do
 * after legacy signups, this script fixes role so /admin/tutors and /admin/mentors match product intent.
 *
 * Run order: see scripts/README-repair-course-author-roles.md
 *
 * Usage:
 *   pnpm exec tsx scripts/repair-course-author-roles.ts           # dry-run (default)
 *   pnpm exec tsx scripts/repair-course-author-roles.ts --apply # write updates
 */
import "dotenv/config";
import { UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

async function main() {
  const apply = process.argv.includes("--apply");

  const distinctAuthorIds = await prisma.course.findMany({
    select: { mentorId: true },
    distinct: ["mentorId"],
  });
  const authorIds = distinctAuthorIds.map((r) => r.mentorId);

  const [mentorsWhoAuthorCourses, tutorsWithZeroCourses] = await Promise.all([
    prisma.user.count({
      where: {
        role: UserRole.MENTOR,
        id: { in: authorIds },
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.TUTOR,
        courses: { none: {} },
      },
    }),
  ]);

  console.log("--- Diagnostics ---");
  console.log(
    `Users with role MENTOR who are a course author (Course.mentorId): ${mentorsWhoAuthorCourses} (target 0 after repair)`,
  );
  console.log(
    `Users with role TUTOR and zero courses (informational): ${tutorsWithZeroCourses}`,
  );
  console.log(`Distinct course author user ids: ${authorIds.length}`);
  console.log(`Mode: ${apply ? "APPLY (writes DB)" : "DRY-RUN (no writes)"}`);
  console.log("--- Per-user ---");

  const users = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, email: true, fullName: true, role: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  let wouldUpdate = 0;
  let skipped = 0;

  for (const id of authorIds) {
    const u = byId.get(id);
    if (!u) {
      console.warn(`[skip] Course references missing user id=${id}`);
      skipped++;
      continue;
    }

    if (u.role === UserRole.TUTOR) {
      continue;
    }

    if (u.role === UserRole.ADMIN) {
      console.warn(
        `[skip] Course author is ADMIN id=${id} email=${u.email} — fix manually if needed`,
      );
      skipped++;
      continue;
    }

    if (u.role === UserRole.STUDENT) {
      console.warn(
        `[skip] Course author is STUDENT id=${id} email=${u.email} — data corruption; fix manually`,
      );
      skipped++;
      continue;
    }

    if (u.role === UserRole.MENTOR) {
      wouldUpdate++;
      console.log(
        `[${apply ? "update" : "would-update"}] ${u.email} (${u.fullName}) MENTOR → TUTOR`,
      );
      if (apply) {
        await prisma.user.update({
          where: { id: u.id },
          data: { role: UserRole.TUTOR },
        });
      }
      continue;
    }

    console.warn(`[skip] Unknown role ${u.role} id=${id}`);
    skipped++;
  }

  console.log("--- Summary ---");
  console.log(`${apply ? "Updated" : "Would update"}: ${wouldUpdate}`);
  console.log(`Skipped: ${skipped}`);
  if (!apply && wouldUpdate > 0) {
    console.log("\nRe-run with --apply after backup to persist changes.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
