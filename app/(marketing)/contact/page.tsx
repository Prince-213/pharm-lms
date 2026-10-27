import type { Metadata } from "next";
import { ContactFormSection } from "@/components/landing/contact-form-section";
import { PathwayFinalCtaSection } from "@/components/landing/pathway-final-cta-section";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with PharmEdge. Send us a message or call the team. We're here to help with your pharmacy education journey.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <ContactFormSection />
      <PathwayFinalCtaSection />
    </main>
  );
}
