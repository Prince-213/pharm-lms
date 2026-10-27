import type { Metadata } from "next";
import { AboutCauseSection } from "@/components/landing/about-cause-section";
import { AboutClosingBand } from "@/components/landing/about-closing-band";
import { AboutHeroSection } from "@/components/landing/about-hero-section";
import { AboutHowWeWork } from "@/components/landing/about-how-we-work";
import { AboutLearnersFirstSection } from "@/components/landing/about-learners-first-section";
import { AboutPathwaySection } from "@/components/landing/about-pathway-section";
import { AboutStandardsSection } from "@/components/landing/about-standards-section";
import { AboutStorySection } from "@/components/landing/about-story-section";
import { AboutWhoWeServe } from "@/components/landing/about-who-we-serve";
import { FAQSection } from "@/components/landing/faq-section";
import { LeadingProfessionalsSection } from "@/components/landing/leading-professionals-section";

export const metadata: Metadata = {
  title: "About PharmEdge",
  description:
    "Learn about PharmEdge — Africa's clinical pharmacy learning platform. Delivering exceptional online education for pharmacy students and professionals.",
  alternates: { canonical: "/about" },
};

export default function AboutUsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <AboutHeroSection />
      <AboutCauseSection />
      <AboutWhoWeServe />
      <AboutStorySection />
      <AboutStandardsSection />
      <AboutHowWeWork />
      <AboutPathwaySection />
      <LeadingProfessionalsSection />
      <AboutLearnersFirstSection />
      <FAQSection />
      <AboutClosingBand />
    </main>
  );
}
