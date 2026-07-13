import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { MentorProfileClient } from "./mentor-profile-client";

export default async function MentorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      fullName: true,
      avatarUrl: true,
      bio: true,
      mentorProfileStatus: true,
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
      mentorProfileSubmittedAt: true,
    },
  });
  if (!user) redirect("/mentor/login");

  const avatarPreviewSrc = await resolveMediaUrl(user.avatarUrl);

  return (
    <MentorProfileClient
      user={{
        ...user,
        mentorProfileSubmittedAt: user.mentorProfileSubmittedAt
          ? user.mentorProfileSubmittedAt.toISOString()
          : null,
      }}
      avatarPreviewSrc={avatarPreviewSrc}
    />
  );
}
