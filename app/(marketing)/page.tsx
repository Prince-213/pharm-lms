import { CategoryCarousel } from "@/components/landing/category-carousel";
import { CourseCategorySection } from "@/components/landing/course-category-section";
import { EmpowerSection } from "@/components/landing/empower-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FeaturedCoursesSection } from "@/components/landing/featured-courses-section";
import { JourneySection } from "@/components/landing/journey-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import LandingHeader from "@/components/landing/header";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";
import { ScrollToTopButton } from "@/components/landing/scroll-to-top-button";
import { WhatLearnersSaySection } from "@/components/landing/what-learners-say-section";
import HomeHeroSection from "@/components/landing/home-hero-section";
import { auth } from "@/auth";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="flex w-full min-h-screen flex-col">
      
        <HomeHeroSection />
        <CategoryCarousel />
        <EmpowerSection />
       {/*  <CourseCategorySection /> */}
        <FeaturedCoursesSection courses={dbCourses} />
        <JourneySection />
        <WhatLearnersSaySection />
        <LeadingProfessionalsSection />
        <FAQSection />
        <NewsletterSection />
      </main>
      
      <ScrollToTopButton />
    </div>
  );
}
