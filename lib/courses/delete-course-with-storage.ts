import { rm } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { deleteCourseGraph, DELETE_COURSE_TRANSACTION_OPTIONS } from "@/lib/courses/delete-course-graph";
import { r2KeyFromMediaUrl } from "@/lib/storage/r2-keys";
import {
  deleteR2ObjectKeys,
  isR2Configured,
  listR2ObjectKeys,
} from "@/lib/storage/r2";

export type DeleteCourseWithStorageResult =
  | { ok: false; error: "NOT_FOUND" }
  | { ok: true; title: string };

async function collectCourseMediaKeys(courseId: string): Promise<string[]> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      thumbnailUrl: true,
      promoVideoUrl: true,
      congratulatoryVideoUrl: true,
      sections: {
        select: {
          lessons: {
            select: { videoUrl: true, downloadableUrl: true },
          },
        },
      },
      assignments: {
        select: {
          instructionsFileUrl: true,
          submissions: { select: { attachmentUrl: true } },
        },
      },
    },
  });
  if (!course) return [];

  const keys = new Set<string>();
  const add = (url: string | null | undefined) => {
    const key = r2KeyFromMediaUrl(url);
    if (key) keys.add(key);
  };

  add(course.thumbnailUrl);
  add(course.promoVideoUrl);
  add(course.congratulatoryVideoUrl);
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      add(lesson.videoUrl);
      add(lesson.downloadableUrl);
    }
  }
  for (const assignment of course.assignments) {
    add(assignment.instructionsFileUrl);
    for (const sub of assignment.submissions) {
      add(sub.attachmentUrl);
    }
  }

  return [...keys];
}

async function deleteCourseStorage(courseId: string): Promise<void> {
  const prefix = `courses/${courseId}/`;
  const keys = new Set<string>(await collectCourseMediaKeys(courseId));

  if (isR2Configured()) {
    for (const key of await listR2ObjectKeys(prefix)) {
      keys.add(key);
    }
    if (keys.size > 0) {
      try {
        await deleteR2ObjectKeys([...keys]);
      } catch (err) {
        console.error("[deleteCourseWithStorage] R2 delete failed:", err);
      }
    }
  }

  const localDir = path.join(process.cwd(), "public", "courses", courseId);
  try {
    await rm(localDir, { recursive: true, force: true });
  } catch {
    // ignore missing local dir
  }
}

/**
 * Deletes course media (R2 prefix + local dev folder) then removes all DB rows.
 */
export async function deleteCourseWithStorage(
  courseId: string,
): Promise<DeleteCourseWithStorageResult> {
  const exists = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!exists) return { ok: false, error: "NOT_FOUND" };

  await deleteCourseStorage(courseId);

  return prisma.$transaction(async (tx) => {
    const result = await deleteCourseGraph(tx, courseId);
    if (!result.ok) return { ok: false as const, error: "NOT_FOUND" as const };
    return { ok: true as const, title: result.title };
  }, DELETE_COURSE_TRANSACTION_OPTIONS);
}
