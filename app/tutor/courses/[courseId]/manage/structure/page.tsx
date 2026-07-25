import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default async function TutorStructurePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <FeatureComingSoon
      title="Course structure tips"
      description="Interactive structure tools are coming soon. Build sections and lectures in the curriculum editor."
      backHref={`/tutor/courses/${courseId}/manage/curriculum`}
      backLabel="Open curriculum"
    />
  );
}
