import type { Metadata } from "next";
import { AudienceFaqSection } from "@/components/landing/audience-faq-section";
import { FeaturedCoursesSection } from "@/components/landing/featured-courses-section";
import { VerifyCertificateSection } from "@/components/landing/verify-certificate-section";
import { VerifyExplainerSection } from "@/components/landing/verify-explainer-section";
import { verifyFaqs } from "@/components/landing/verify-faq-data";
import { safeAuth } from "@/lib/auth/safe-session";
import { loadLandingPopularCoursePages } from "@/lib/landing/load-landing-data";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description:
    "Check a PharmEdge certificate. Enter the certificate ID to confirm it was issued on the platform.",
  alternates: { canonical: "/validate" },
};

export default async function ValidatePage() {
  const session = await safeAuth();
  const studentId =
    session?.user?.role === "STUDENT" ? session.user.id : undefined;
  const pages = await loadLandingPopularCoursePages(studentId, 3, 3);

  const firstPage = pages[0] ?? [];
  const dbCourses =
    firstPage.length > 0
      ? firstPage.map((c) => {
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
      <VerifyCertificateSection />
      <VerifyExplainerSection />
      <AudienceFaqSection
        title="Questions employers ask before they trust a file."
        faqs={verifyFaqs}
      />
      <FeaturedCoursesSection courses={dbCourses} />
    </main>
  );
}
