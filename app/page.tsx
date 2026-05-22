import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { PartnersSection } from "@/components/landing/partners-section";
import { ServicesSection } from "@/components/landing/services-section";
import { PopularCoursesSection } from "@/components/landing/popular-courses-section";
import { TutorsSection } from "@/components/landing/tutors-section";
import { TestimonialSection } from "@/components/landing/testimonial-section";
import { BlogSection } from "@/components/landing/blog-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar />
      <main className="">
        <HeroSection />
        
        <ServicesSection />
        <PopularCoursesSection />
        <TutorsSection />
        <TestimonialSection />
        <BlogSection />
      </main>
      <LandingFooter />
    </div>
  );
}
