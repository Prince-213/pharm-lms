import type { Metadata } from "next";
import { CategoryCarousel } from "@/components/landing/category-carousel";
import { CourseCategorySection } from "@/components/landing/course-category-section";
import { EmpowerSection } from "@/components/landing/empower-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FeaturedCoursesSection } from "@/components/landing/featured-courses-section";
import { JourneySection } from "@/components/landing/journey-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";
import { WhatLearnersSaySection } from "@/components/landing/what-learners-say-section";
import { AnimatedSection } from "@/components/landing/animated-section";
import HomeHeroSection from "@/components/landing/home-hero-section";
import { auth } from "@/auth";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

export const metadata: Metadata = {
  title: "Clinical Pharmacy Courses & Online Learning",
  description:
    "Discover top online pharmacy courses on PharmLMS. Learn clinical skills, patient safety, drug interactions, and more with expert instructors. Start learning today.",
  alternates: { canonical: "/" },
};

export default async function Home() {
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
    <main className="flex w-full min-h-screen flex-col">
      <HomeHeroSection />

      <AnimatedSection delay={0.1}>
        <CategoryCarousel />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <EmpowerSection />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <CourseCategorySection />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <FeaturedCoursesSection courses={dbCourses} />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <JourneySection />
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
  );
}
