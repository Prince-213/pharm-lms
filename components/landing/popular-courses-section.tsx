import { auth } from "@/auth";
import { PopularCoursesCarousel } from "@/components/landing/popular-courses-carousel";
import { getLandingContent, type LandingAudience } from "@/lib/landing-content";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

type PopularCoursesSectionProps = {
  audience?: LandingAudience;
};

export async function PopularCoursesSection({
  audience = "student",
}: PopularCoursesSectionProps) {
  const { programs } = getLandingContent(audience);
  const session = await auth();
  const pages = await loadLandingPopularCoursePages(session?.user?.id, 3, 9);

  return (
    <PopularCoursesCarousel
      eyebrow={programs.eyebrow}
      title={programs.title}
      description={programs.description}
      pages={pages}
      cta={{ label: programs.cta.label, href: "/courses" }}
    />
  );
}
