import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default function TutorEngagementPage() {
  return (
    <FeatureComingSoon
      title="Engagement analytics"
      description="Live engagement metrics are not wired yet. Check student enrollments and reviews from your courses list."
      backHref="/tutor/courses"
      backLabel="Back to courses"
    />
  );
}
