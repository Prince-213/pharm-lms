import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default async function TutorCaptionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <FeatureComingSoon
      title="Captions"
      description="Caption upload and linking to lessons is coming soon. Upload lesson media from the curriculum editor for now."
      backHref={`/tutor/courses/${courseId}/manage`}
      backLabel="Back to course manage"
    />
  );
}
