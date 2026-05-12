/**
 * Backfills Course.estimatedDurationMinutes for rows created before the duration
 * field existed or where it was never set, using the same rules as the catalog:
 * sum of lesson durationSec plus a flat 30-minute bump when the course has at
 * least one article-like lesson (substantial text, no video URL, no positive duration).
 *
 * Usage:
 *   pnpm exec tsx scripts/backfill-course-estimated-duration.ts           # dry-run
 *   pnpm exec tsx scripts/backfill-course-estimated-duration.ts --apply # write DB
 */
import "dotenv/config";
import { derivedDurationSecondsFromSections } from "../lib/course-duration";
import { prisma } from "../lib/prisma";

async function main() {
  const apply = process.argv.includes("--apply");

  const courses = await prisma.course.findMany({
    where: {
      OR: [{ estimatedDurationMinutes: null }, { estimatedDurationMinutes: 0 }],
    },
    select: {
      id: true,
      title: true,
      estimatedDurationMinutes: true,
      sections: {
        orderBy: { position: "asc" },
        select: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              content: true,
              videoUrl: true,
              durationSec: true,
            },
          },
        },
      },
    },
  });

  console.log(
    `Found ${courses.length} course(s) with null or zero estimatedDurationMinutes.`,
  );
  console.log(`Mode: ${apply ? "APPLY (writes DB)" : "DRY-RUN (no writes)"}\n`);

  let updated = 0;
  let wouldUpdate = 0;
  let skippedNoSignal = 0;

  for (const c of courses) {
    const derivedSec = derivedDurationSecondsFromSections(c.sections);
    if (derivedSec <= 0) {
      console.log(
        `[skip] ${c.id} "${c.title.slice(0, 60)}${c.title.length > 60 ? "…" : ""}" — no derivable duration (no video lengths / article bump).`,
      );
      skippedNoSignal++;
      continue;
    }

    wouldUpdate++;
    const minutes = Math.max(1, Math.ceil(derivedSec / 60));

    console.log(
      `[${apply ? "apply" : "dry-run"}] ${c.id} "${c.title.slice(0, 60)}${c.title.length > 60 ? "…" : ""}" → estimatedDurationMinutes=${minutes} (from ${derivedSec}s derived)`,
    );

    if (apply) {
      await prisma.course.update({
        where: { id: c.id },
        data: { estimatedDurationMinutes: minutes },
      });
      updated++;
    }
  }

  console.log("\n--- Summary ---");
  if (apply) {
    console.log(`Updated: ${updated}`);
  } else {
    console.log(`Would update: ${wouldUpdate} (re-run with --apply)`);
  }
  console.log(`Skipped (no derivable duration): ${skippedNoSignal}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
