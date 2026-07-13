export function buildCoursePlayerHref(
  courseId: string,
  lessonId: string | null,
  tab: string,
): string {
  const base = `/student/course/${courseId}`;
  const params = new URLSearchParams();
  if (lessonId) params.set("lesson", lessonId);
  if (tab !== "overview") params.set("tab", tab);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
