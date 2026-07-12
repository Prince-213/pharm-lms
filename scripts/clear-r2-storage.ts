import { rm } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import { prisma } from "@/lib/prisma";
import {
  deleteR2ObjectKeys,
  isR2Configured,
  listAllR2ObjectKeys,
  r2Bucket,
} from "@/lib/storage/r2";

const apply = process.argv.includes("--apply");
const clearDb = process.argv.includes("--clear-db");

async function clearLocalCourseUploads(): Promise<void> {
  const localDir = path.join(process.cwd(), "public", "courses");
  try {
    await rm(localDir, { recursive: true, force: true });
    console.log("[clear-r2-storage] removed local public/courses/");
  } catch (err) {
    console.warn("[clear-r2-storage] could not remove public/courses:", err);
  }
}

/** Match rows whose string field points at uploaded object storage. */
function uploadedUrlWhere<TField extends string>(field: TField) {
  return {
    OR: [
      { [field]: { startsWith: "r2://" } },
      { [field]: { startsWith: "/courses/" } },
      { [field]: { contains: "r2.cloudflarestorage.com" } },
    ],
  } as const;
}

async function clearDatabaseMediaRefs(): Promise<void> {
  // Sequential updates — avoids Neon transaction start timeouts (P2028).
  const users = await prisma.user.updateMany({
    where: uploadedUrlWhere("avatarUrl"),
    data: { avatarUrl: null },
  });
  const courses = await prisma.course.updateMany({
    where: {
      OR: [
        ...uploadedUrlWhere("thumbnailUrl").OR,
        ...uploadedUrlWhere("promoVideoUrl").OR,
        ...uploadedUrlWhere("congratulatoryVideoUrl").OR,
      ],
    },
    data: {
      thumbnailUrl: null,
      promoVideoUrl: null,
      congratulatoryVideoUrl: null,
    },
  });
  const lessons = await prisma.lesson.updateMany({
    where: {
      OR: [
        ...uploadedUrlWhere("videoUrl").OR,
        ...uploadedUrlWhere("downloadableUrl").OR,
      ],
    },
    data: { videoUrl: null, downloadableUrl: null },
  });
  const assignments = await prisma.assignment.updateMany({
    where: uploadedUrlWhere("instructionsFileUrl"),
    data: { instructionsFileUrl: null },
  });
  const submissions = await prisma.assignmentSubmission.updateMany({
    where: uploadedUrlWhere("attachmentUrl"),
    data: { attachmentUrl: null },
  });

  console.log("[clear-r2-storage] cleared DB media refs:", {
    avatars: users.count,
    courses: courses.count,
    lessons: lessons.count,
    assignments: assignments.count,
    submissions: submissions.count,
  });
}

async function main() {
  const r2Ready = isR2Configured();
  if (!r2Ready && !clearDb) {
    console.error(
      "[clear-r2-storage] R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
    process.exit(1);
  }

  if (r2Ready) {
    console.log(`[clear-r2-storage] bucket=${r2Bucket}`);
  } else {
    console.log("[clear-r2-storage] R2 not configured — skipping bucket steps.");
  }
  console.log(
    `[clear-r2-storage] mode=${apply ? "APPLY (destructive)" : "dry-run"} clearDb=${clearDb}`,
  );

  const keys = r2Ready ? await listAllR2ObjectKeys() : [];
  console.log(`[clear-r2-storage] found ${keys.length} object(s) in bucket`);

  if (keys.length > 0) {
    const sample = keys.slice(0, 10);
    console.log("[clear-r2-storage] sample keys:", sample);
    if (keys.length > 10) {
      console.log(`[clear-r2-storage] ... and ${keys.length - 10} more`);
    }
  }

  if (!apply) {
    console.log(
      "[clear-r2-storage] dry-run only. Re-run with --apply to delete bucket objects.",
    );
    if (clearDb) {
      console.log(
        "[clear-r2-storage] add --apply together with --clear-db to wipe DB media URLs too.",
      );
    }
    return;
  }

  if (keys.length > 0) {
    await deleteR2ObjectKeys(keys);
    console.log(`[clear-r2-storage] deleted ${keys.length} object(s) from R2`);
  } else if (r2Ready) {
    console.log("[clear-r2-storage] bucket already empty");
  }

  if (apply) {
    await clearLocalCourseUploads();
  }

  if (clearDb) {
    await clearDatabaseMediaRefs();
  } else {
    console.log(
      "[clear-r2-storage] DB media URLs kept. Pass --clear-db to null uploaded storage references.",
    );
  }

  console.log("[clear-r2-storage] done.");
}

main()
  .catch((err) => {
    console.error("[clear-r2-storage] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
