import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AnimatedSection } from "@/components/landing/animated-section";
import { CourseCatalogDetail } from "@/components/student/course-catalog-detail";
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
        <AnimatedSection>
          <CourseCatalogDetail
            variant="catalog"
            interaction="student"
            data={data}
            catalogNavOverride={{ href: "/courses", label: "Catalog" }}
          />
        </AnimatedSection>
      </div>
    );  }

  const data = await loadPublicCourseCatalogDetail(
    courseId,
    session?.user?.id,
  );
  if (!data) notFound();

  const callbackUrl = `/courses/${courseId}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main>
        <AnimatedSection>
          <CourseCatalogDetail
            variant="catalog"
            interaction="guest"
            data={data}
            catalogNavOverride={{ href: "/courses", label: "Catalog" }}
            guestAuth={{ callbackUrl }}
          />
        </AnimatedSection>
      </main>
    </div>
  );
}