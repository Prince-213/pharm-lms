import { ContactFormSection } from "@/components/landing/contact-form-section";
import { ContactHeroSection } from "@/components/landing/contact-hero-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <ContactHeroSection />
        <ContactFormSection />
        <NewsletterSection />
      </main>
    </div>
  );
}
