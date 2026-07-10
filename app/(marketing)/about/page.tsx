import type { Metadata } from "next";
import { AboutFreshSection } from "@/components/landing/about-fresh-section";
import { AboutHeroSection } from "@/components/landing/about-hero-section";
import { AnimatedSection } from "@/components/landing/animated-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { WhatLearnersSaySection } from "@/components/landing/what-learners-say-section";

export const metadata: Metadata = {
  title: "About PharmLMS",
  description:
    "Learn about PharmLMS — Africa's clinical pharmacy learning platform. Delivering exceptional online education for pharmacy students and professionals.",
  alternates: { canonical: "/about" },
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <AnimatedSection>
          <AboutHeroSection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <AboutFreshSection />
        </AnimatedSection>
        <div className="flex flex-col gap-y-20">
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
        </div>
      </main>
    </div>
  );
}
