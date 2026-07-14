import type { Metadata } from "next";
import { AnimatedSection } from "@/components/landing/animated-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FeaturedCoursesSection } from "@/components/landing/featured-courses-section";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { ValidateHeroSection } from "@/components/landing/validate-hero-section";
import { WhatLearnersSaySection } from "@/components/landing/what-learners-say-section";
import { safeAuth } from "@/lib/auth/safe-session";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

export const metadata: Metadata = {
  title: "Validate Certificate",
  description:
    "Verify the authenticity of your PharmLMS certificate. Enter your certificate ID to confirm your course completion credentials.",
  alternates: { canonical: "/validate" },
};

export default async function ValidatePage() {
  const session = await safeAuth();
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
        <AnimatedSection>
          <ValidateHeroSection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <FeaturedCoursesSection courses={dbCourses} />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <WhatLearnersSaySection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <LeadingProfessionalsSection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <NewsletterSection />
        </AnimatedSection>
      </main>
    </div>
  );
}
