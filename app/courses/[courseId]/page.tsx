import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CourseCatalogDetail } from "@/components/student/course-catalog-detail";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { UserRole } from "@/generated/prisma/enums";
import { loadCourseCatalogDetail } from "@/lib/course-catalog-detail";
import { loadPublicCourseCatalogDetail } from "@/lib/courses/public-catalog";

export default async function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();

  if (session?.user?.role === UserRole.STUDENT) {
    const data = await loadCourseCatalogDetail(courseId, {
      id: session.user.id,
      role: session.user.role,
    });
    if (!data) notFound();

    return (
      <div className="min-h-screen bg-[var(--background)]">
        <LandingNavbar audience="student" />
        <CourseCatalogDetail
          variant="catalog"
          interaction="student"
          data={data}
          catalogNavOverride={{ href: "/courses", label: "Catalog" }}
        />
        <LandingFooter />
      </div>
    );
  }

  const data = await loadPublicCourseCatalogDetail(courseId);
  if (!data) notFound();

  const callbackUrl = `/courses/${courseId}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LandingNavbar audience="student" />
      <CourseCatalogDetail
        variant="catalog"
        interaction="guest"
        data={data}
        catalogNavOverride={{ href: "/courses", label: "Catalog" }}
        guestAuth={{ callbackUrl }}
      />
      <LandingFooter />
    </div>
  );
}
