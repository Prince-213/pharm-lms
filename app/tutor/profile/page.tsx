import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { TutorProfileClient } from "./tutor-profile-client";

export default async function TutorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialSettingsTab = tab === "accounts" ? "accounts" : undefined;
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
      tutorProfileCompletedAt: true,
    },
  });
  if (!user) redirect("/tutor/login");

  const avatarPreviewSrc = await resolveMediaUrl(user.avatarUrl);

  const payoutRow = await db.tutorPayoutAccount.findUnique({
    where: { userId: session.user.id },
    select: {
      accountName: true,
      bankCode: true,
      accountNumber: true,
      verifiedAt: true,
    },
  });

  const payoutSummary = payoutRow?.accountName
    ? {
        accountName: payoutRow.accountName,
        bankCode: payoutRow.bankCode,
        accountMasked:
          payoutRow.accountNumber.length <= 4
            ? "••••"
            : `••••${payoutRow.accountNumber.slice(-4)}`,
        verified: Boolean(payoutRow.verifiedAt),
      }
    : null;

  return (
    <TutorProfileClient
      user={{
        ...user,
        tutorProfileCompletedAt: user.tutorProfileCompletedAt
          ? user.tutorProfileCompletedAt.toISOString()
          : null,
      }}
      avatarPreviewSrc={avatarPreviewSrc}
      payoutSummary={payoutSummary}
      initialSettingsTab={initialSettingsTab}
    />
  );
}
