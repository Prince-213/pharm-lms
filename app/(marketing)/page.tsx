import type { Metadata } from "next";
import { CareersLeadSection } from "@/components/landing/careers-lead-section";
import { FeaturedCoursesSection } from "@/components/landing/featured-courses-section";
import { InstructorsStripSection } from "@/components/landing/instructors-strip-section";
import { PathwayFaqSection } from "@/components/landing/pathway-faq-section";
import { PathwayFinalCtaSection } from "@/components/landing/pathway-final-cta-section";
import { PathwayHeroSection } from "@/components/landing/pathway-hero-section";
import { PathwayLevelsSection } from "@/components/landing/pathway-levels-section";
import { VerifyBandSection } from "@/components/landing/verify-band-section";
import { WhoItsForSection } from "@/components/landing/who-its-for-section";
import { safeAuth } from "@/lib/auth/safe-session";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

export const metadata: Metadata = {
  title: "Clinical Pharmacy Courses & Online Learning",
  description:
    "Discover expert-led pharmacy courses on PharmEdge. Learn clinical skills and grow your career. Start learning today.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const session = await safeAuth();
  const studentId = session?.user?.role === "STUDENT" ? session.user.id : undefined;
  const pages = await loadLandingPopularCoursePages(studentId, 3, 3);

  const dbCourses =
    (pages[0]?.length ?? 0) > 0
      ? pages[0]!.map((c) => {
          const count = c.lessonCount ?? 0;
          return {
            id: c.id,
            href: c.href,
            title: c.title,
            priceLabel: c.priceLabel,
            instructor: { name: c.instructor.name },
            lessons:
              count > 0
                ? `${count} ${count === 1 ? "Lesson" : "Lessons"}`
                : "Lessons",
            duration: c.duration ?? "5 Hour",
            image: c.image || "/assets/featured-courses/course-1.jpg",
            imageAlt: c.imageAlt,
          };
        })
      : undefined;

  return (
    <main className="flex min-h-screen w-full flex-col">
      <PathwayHeroSection />
      <WhoItsForSection />
      <FeaturedCoursesSection courses={dbCourses} />
      <PathwayLevelsSection />
      <CareersLeadSection />
      <VerifyBandSection />
      <InstructorsStripSection />
      <PathwayFaqSection />
      <PathwayFinalCtaSection />
    </main>
  );
}
