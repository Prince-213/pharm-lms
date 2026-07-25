import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";

export default function TutorTrafficPage() {
  return (
    <FeatureComingSoon
      title="Traffic & conversion"
      description="Full traffic analytics are not available yet. Checkout and enrollment data live under admin payments."
      backHref="/tutor/courses"
      backLabel="Back to courses"
    />
  );
}
