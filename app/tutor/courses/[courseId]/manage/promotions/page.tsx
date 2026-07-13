import { redirect } from "next/navigation";

export default async function MentorCoursePromotionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(`/tutor/courses/${courseId}/manage/pricing`);
}
