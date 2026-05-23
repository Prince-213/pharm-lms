import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { InstructorProfilePage } from "@/components/student/instructor-profile-page";
import { UserRole } from "@/generated/prisma/enums";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { loadTutorProfileForStudent } from "@/lib/student/load-instructor-profile";

type SearchParams = { courseId?: string };

export default async function StudentTutorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tutorId: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/tutors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { tutorId } = await params;
  const { courseId } = (await searchParams) ?? {};

  const profile = await loadTutorProfileForStudent(tutorId, session.user.id);
  if (!profile) notFound();

  const avatarSrc = await resolveMediaUrl(profile.avatarUrl);
  const thumbs = await Promise.all(
    profile.publishedCourses.map((c) => resolveMediaUrl(c.thumbnailUrl)),
  );
  const publishedWithThumbs = profile.publishedCourses.map((c, i) => ({
    ...c,
    thumbnailUrl: thumbs[i] ?? c.thumbnailUrl,
  }));
  const enrolledWithThumbs = publishedWithThumbs.filter((c) => c.isEnrolled);

  return (
    <InstructorProfilePage
      profile={profile}
      avatarSrc={avatarSrc}
      enrolledCourses={enrolledWithThumbs}
      publishedCourses={publishedWithThumbs}
      initialCourseId={courseId ?? null}
      backHref="/student/tutors"
      backLabel="Back to tutors"
    />
  );
}
