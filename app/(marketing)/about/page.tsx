import { AboutFreshSection } from "@/components/landing/about-fresh-section";
import { AboutHeroSection } from "@/components/landing/about-hero-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { WhatLearnersSaySection } from "@/components/landing/what-learners-say-section";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <AboutHeroSection />
        <AboutFreshSection />
        <div className="flex flex-col gap-y-20">
          <WhatLearnersSaySection />
          <LeadingProfessionalsSection />
          <FAQSection />
          <NewsletterSection />
        </div>
      </main>
    </div>
  );
}
