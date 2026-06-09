import { FAQSection } from "@/components/landing/faq-section";
import { FeaturedCoursesSection } from "@/components/landing/featured-courses-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { ScrollToTopButton } from "@/components/landing/scroll-to-top-button";
import { ValidateHeroSection } from "@/components/landing/validate-hero-section";
import { WhatLearnersSaySection } from "@/components/landing/what-learners-say-section";
import { auth } from "@/auth";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

export default async function ValidatePage() {
  const session = await auth();
  const studentId = session?.user?.role === "STUDENT" ? session.user.id : undefined;
  const pages = await loadLandingPopularCoursePages(studentId, 3, 3);

  const dbCourses = (pages[0]?.length ?? 0) > 0
    ? pages[0]!.map((c) => ({
        id: c.id,
        href: `/courses/${c.id}`,
        title: c.title,
        priceLabel: c.priceLabel,
        instructor: c.instructor,
        lessons: "Lessons",
        duration: c.duration ?? "5 Hour",
        image: c.image || "/assets/featured-courses/course-1.jpg",
      }))
    : undefined;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <ValidateHeroSection />
        <FeaturedCoursesSection courses={dbCourses} />
        <WhatLearnersSaySection />
        <LeadingProfessionalsSection />
        <FAQSection />
        <NewsletterSection />
      </main>
     
      <ScrollToTopButton />
    </div>
  );
}
