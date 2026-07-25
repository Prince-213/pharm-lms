import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default async function TutorFilmPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <FeatureComingSoon
      title="Film & edit"
      description="This practice workspace does not save uploads to your course yet. Add videos through the curriculum editor."
      backHref={`/tutor/courses/${courseId}/manage`}
      backLabel="Back to course manage"
    />
  );
}
