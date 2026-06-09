import { ContactFormSection } from "@/components/landing/contact-form-section";
import { ContactHeroSection } from "@/components/landing/contact-hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { ScrollToTopButton } from "@/components/landing/scroll-to-top-button";

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
