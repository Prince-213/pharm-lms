import { db } from "@/lib/db";

export async function listDistinctCourseCategories(): Promise<string[]> {
  const rows = await db.course.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });
  return rows
    .map((row) => row.category?.trim())
    .filter((c): c is string => Boolean(c))
    .sort((a, b) => a.localeCompare(b));
}
