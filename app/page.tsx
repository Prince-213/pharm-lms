import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ogImagePaths, siteConfig } from "@/lib/site-metadata";
import { HeroSection } from "@/components/landing/hero-section";
import { ServicesSection } from "@/components/landing/services-section";
import { PopularCoursesSection } from "@/components/landing/popular-courses-section";
import { TutorsSection } from "@/components/landing/tutors-section";
import { TestimonialSection } from "@/components/landing/testimonial-section";
import { BlogSection } from "@/components/landing/blog-section";
import { LandingFooter } from "@/components/landing/landing-footer";

const audience = "student" as const;

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: ogImagePaths.home,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — clinical pharmacy courses online`,
      },
      {
        url: ogImagePaths.default,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}`,
      },
    ],
  },
  twitter: {
    images: [ogImagePaths.home, ogImagePaths.default],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar audience={audience} />
      <main>
        <HeroSection audience={audience} />
        <ServicesSection audience={audience} />
        <PopularCoursesSection audience={audience} />
        <TutorsSection audience={audience} />
        <TestimonialSection audience={audience} />
        <BlogSection audience={audience} />
      </main>
      <LandingFooter />
    </div>
  );
}
