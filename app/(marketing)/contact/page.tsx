import type { Metadata } from "next";
import { AnimatedSection } from "@/components/landing/animated-section";
import { ContactFormSection } from "@/components/landing/contact-form-section";
import { ContactHeroSection } from "@/components/landing/contact-hero-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with PharmLMS. Send us a message, visit our office, or call us. We're here to help with your pharmacy education journey.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <AnimatedSection>
          <ContactHeroSection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <ContactFormSection />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <NewsletterSection />
        </AnimatedSection>
      </main>
    </div>
  );
}
