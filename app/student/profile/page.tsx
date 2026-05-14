import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { StudentProfileClient } from "./student-profile-client";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/profile");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      fullName: true,
      avatarUrl: true,
      bio: true,
      mentorHeadline: true,
      mentorSpecialties: true,
      mentorYearsExperience: true,
      phoneNumber: true,
      country: true,
      state: true,
      city: true,
      addressLine1: true,
      addressLine2: true,
      postalCode: true,
      websiteUrl: true,
      linkedinUrl: true,
    },
  });
  if (!user) redirect("/student/login");

  const avatarPreviewSrc = await resolveMediaUrl(user.avatarUrl);

  return (
    <StudentProfileClient user={user} avatarPreviewSrc={avatarPreviewSrc} />
  );
}
