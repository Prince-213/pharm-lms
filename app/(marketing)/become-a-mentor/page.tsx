import type { Metadata } from "next";
import { AudienceCtaBand } from "@/components/landing/audience-cta-band";
import { AudienceHeroSection } from "@/components/landing/audience-hero-section";
import { AudienceValueSection } from "@/components/landing/audience-value-section";
import { AnimatedSection } from "@/components/landing/animated-section";
import { mentorPageContent } from "@/lib/audience-landing-content";

export const metadata: Metadata = {
  title: "Mentor on PharmLMS",
  description:
    "Guide pharmacy students and professionals on PharmLMS. Offer mentorship sessions, career guidance, and flexible 1:1 support across Africa.",
  alternates: { canonical: "/become-a-mentor" },
};

export default function BecomeAMentorPage() {
  const content = mentorPageContent;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <AnimatedSection>
          <AudienceHeroSection content={content} />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <AudienceValueSection content={content} />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <AudienceCtaBand content={content} />
        </AnimatedSection>
      </main>
    </div>
  );
}
