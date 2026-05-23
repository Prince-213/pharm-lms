import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { InstructorProfilePage } from "@/components/student/instructor-profile-page";
import { UserRole } from "@/generated/prisma/enums";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { loadMentorProfileForStudent } from "@/lib/student/load-instructor-profile";

export default async function StudentMentorDetailPage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/mentors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { mentorId } = await params;
  const profile = await loadMentorProfileForStudent(mentorId);
  if (!profile) notFound();

  const avatarSrc = await resolveMediaUrl(profile.avatarUrl);

  return (
    <InstructorProfilePage
      profile={profile}
      avatarSrc={avatarSrc}
      backHref="/student/mentors"
      backLabel="Back to mentors"
    />
  );
}
