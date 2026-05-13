import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseCatalogDetail } from "@/components/student/course-catalog-detail";
import { requireAdminSession } from "@/lib/admin-auth";
import { loadCourseCatalogDetail } from "@/lib/course-catalog-detail";

export default async function AdminCourseCatalogOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await requireAdminSession();
  const { courseId } = await params;

  const data = await loadCourseCatalogDetail(
    courseId,
    { id: session.user.id, role: session.user.role },
    { adminCatalogAccess: true },
  );
  if (!data) notFound();

  return (
    <>
      <AdminPageHeader
        title="Course overview"
        description="Catalog-style view (read-only). Student enroll and wishlist actions are disabled."
      />
      <CourseCatalogDetail
        variant="catalog"
        interaction="readonly"
        data={data}
        catalogNavOverride={{
          href: "/admin/course-approvals",
          label: "Course approvals",
        }}
      />
    </>
  );
}
