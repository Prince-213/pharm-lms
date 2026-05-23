import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ServicesSection } from "@/components/landing/services-section";
import { PopularCoursesSection } from "@/components/landing/popular-courses-section";
import { TutorsSection } from "@/components/landing/tutors-section";
import { TestimonialSection } from "@/components/landing/testimonial-section";
import { BlogSection } from "@/components/landing/blog-section";
import { LandingFooter } from "@/components/landing/landing-footer";

const audience = "mentor" as const;

export default function ForMentorsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar audience={audience} />
      <main>
        <HeroSection audience={audience} />
        <ServicesSection audience={audience} />
        <PopularCoursesSection audience={audience} />
        <TutorsSection audience={audience} />
        <TestimonialSection audience={audience} />
        <BlogSection audience={audience} />
      </main>
      <LandingFooter />
    </div>
  );
}
