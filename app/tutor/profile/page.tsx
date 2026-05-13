import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";
import { TutorProfileClient } from "./tutor-profile-client";

export default async function TutorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login?callbackUrl=/tutor/profile");
  if (session.user.role !== UserRole.TUTOR)
    redirect(roleHomePath(session.user.role));

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
  if (!user) redirect("/tutor/login");

  return <TutorProfileClient user={user} />;
}
