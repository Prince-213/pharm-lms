/** Starter suggestions — tutors can always type a custom category. */
export const SUGGESTED_COURSE_CATEGORIES = [
  "Business",
  "Finance & Accounting",
  "Marketing",
  "Sales",
  "Entrepreneurship",
  "Leadership & Management",
  "Personal Development",
  "Career Development",
  "Design",
  "Graphic Design",
  "Web Development",
  "Software Development",
  "Data Science",
  "IT & Software",
  "Photography & Video",
  "Music",
  "Health & Fitness",
  "Lifestyle",
  "Teaching & Academics",
  "Language Learning",
  "Test Preparation",
  "Pharmacy",
  "Clinical Pharmacy",
  "Pharmacology",
  "Healthcare",
  "Nursing",
  "Medicine",
  "Public Health",
  "Laboratory Science",
  "Patient Safety",
  "Research Methods",
] as const;

export function mergeCategoryOptions(
  suggested: readonly string[],
  existing: string[],
): string[] {
  const set = new Set<string>();
  for (const value of [...suggested, ...existing]) {
    const trimmed = value.trim();
    if (trimmed) set.add(trimmed);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
