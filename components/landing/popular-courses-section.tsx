import { auth } from "@/auth";
import { PopularCoursesCarousel } from "@/components/landing/popular-courses-carousel";
import type { PopularCourseCardView } from "@/components/landing/popular-courses-carousel";
import { formatLandingUsdMajorPrice } from "@/lib/currency/format-landing-price";
import { getStudentPricingContext } from "@/lib/currency/student-pricing-context";
import {
  getLandingContent,
  type LandingAudience,
  type LandingProgramCard,
} from "@/lib/landing-content";

type PopularCoursesSectionProps = {
  audience?: LandingAudience;
};

async function mapProgramPage(
  page: LandingProgramCard[],
  displayCurrency: Awaited<
    ReturnType<typeof getStudentPricingContext>
  >["displayCurrency"],
): Promise<PopularCourseCardView[]> {
  return Promise.all(
    page.map(async (course) => ({
      image: course.image,
      imageAlt: course.imageAlt,
      category: course.category,
      title: course.title,
      description: course.description,
      rating: course.rating,
      reviewCount: course.reviewCount,
      instructor: course.instructor,
      duration: course.duration,
      priceLabel: await formatLandingUsdMajorPrice(
        course.price,
        displayCurrency,
      ),
    })),
  );
}

export async function PopularCoursesSection({
  audience = "student",
}: PopularCoursesSectionProps) {
  const { programs } = getLandingContent(audience);
  const session = await auth();
  const { displayCurrency } = await getStudentPricingContext(session?.user?.id);

  const pages = await Promise.all(
    programs.pages.map((page) => mapProgramPage(page, displayCurrency)),
  );

  return (
    <PopularCoursesCarousel
      eyebrow={programs.eyebrow}
      title={programs.title}
      description={programs.description}
      pages={pages}
      cta={programs.cta}
    />
  );
}
