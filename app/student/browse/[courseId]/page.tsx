import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseCatalogDetail } from "@/components/student/course-catalog-detail";
import { loadCourseCatalogDetail } from "@/lib/course-catalog-detail";

export default async function StudentCourseCatalogDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/student/login?callbackUrl=/student/browse/${(await params).courseId}`,
    );
  }

  const { courseId } = await params;
  const data = await loadCourseCatalogDetail(courseId, {
    id: session.user.id,
    role: session.user.role,
  });
  if (!data) notFound();

  return <CourseCatalogDetail variant="catalog" data={data} />;
}
