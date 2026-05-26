import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogSection } from "@/components/landing/blog-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  PopularCoursesSectionSkeleton,
} from "@/components/landing/landing-page-skeleton";
import { MentorsSection } from "@/components/landing/mentors-section";
import { PopularCoursesSection } from "@/components/landing/popular-courses-section";
import { ServicesSection } from "@/components/landing/services-section";
import { TestimonialSection } from "@/components/landing/testimonial-section";
import { TutorsSection } from "@/components/landing/tutors-section";
import { ogImagePaths, siteConfig } from "@/lib/site-metadata";

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
        <Suspense fallback={<PopularCoursesSectionSkeleton />}>
          <PopularCoursesSection audience={audience} />
        </Suspense>
        <Suspense fallback={null}>
          <TutorsSection audience={audience} />
        </Suspense>
        <Suspense fallback={null}>
          <MentorsSection />
        </Suspense>
        <TestimonialSection audience={audience} />
        <Suspense fallback={null}>
          <BlogSection audience={audience} />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
