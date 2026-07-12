import type { Metadata } from "next";
import { AudienceCtaBand } from "@/components/landing/audience-cta-band";
import { AudienceHeroSection } from "@/components/landing/audience-hero-section";
import { AudienceValueSection } from "@/components/landing/audience-value-section";
import { AnimatedSection } from "@/components/landing/animated-section";
import { teachPageContent } from "@/lib/audience-landing-content";

export const metadata: Metadata = {
  title: "Teach on PharmLMS",
  description:
    "Publish pharmacy courses on PharmLMS. Reach practitioners across Africa with a professional course builder, curriculum tools, and a dedicated tutor dashboard.",
  alternates: { canonical: "/teach" },
};

export default function TeachPage() {
  const content = teachPageContent;

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
