import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default async function TutorPromotionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <FeatureComingSoon
      title="Promotions"
      description="Course-level promotional campaigns are not available yet. Platform coupons are managed by admins."
      backHref={`/tutor/courses/${courseId}/manage`}
      backLabel="Back to course manage"
    />
  );
}
