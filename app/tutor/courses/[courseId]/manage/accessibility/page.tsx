import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default async function TutorAccessibilityPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <FeatureComingSoon
      title="Accessibility settings"
      description="Persisted accessibility options for this course are not available yet. Use the curriculum editor for lesson content."
      backHref={`/tutor/courses/${courseId}/manage`}
      backLabel="Back to course manage"
    />
  );
}
