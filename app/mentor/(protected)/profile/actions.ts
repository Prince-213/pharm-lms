"use server";

import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import {
  revalidateAdminPortal,
  revalidateMentorPortal,
} from "@/lib/cache/revalidate-portals";
import { db } from "@/lib/db";
import { notifyAdminsMentorProfileSubmitted } from "@/lib/notifications/mentor-events";

type ActionResult = { ok: true } | { ok: false; message: string };

function asOptionalString(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function asOptionalInt(v: FormDataEntryValue | null): number | null {
  const raw = String(v ?? "").trim();
  if (!raw.length) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
}

export async function updateMentorProfileAction(input: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.MENTOR) {
    return { ok: false, message: "Unauthorized." };
  }

  const fullName = String(input.get("fullName") ?? "").trim();
  const bio = String(input.get("bio") ?? "").trim();
  const avatarUrl = asOptionalString(input.get("avatarUrl"));
  const phoneNumber = asOptionalString(input.get("phoneNumber"));
  const mentorHeadline = asOptionalString(input.get("mentorHeadline"));
  const mentorSpecialties = asOptionalString(input.get("mentorSpecialties"));
  const mentorYearsExperience = asOptionalInt(input.get("mentorYearsExperience"));
  const country = asOptionalString(input.get("country"));
  const state = asOptionalString(input.get("state"));
  const city = asOptionalString(input.get("city"));
  const addressLine1 = asOptionalString(input.get("addressLine1"));
  const addressLine2 = asOptionalString(input.get("addressLine2"));
  const postalCode = asOptionalString(input.get("postalCode"));
  const websiteUrl = asOptionalString(input.get("websiteUrl"));
  const linkedinUrl = asOptionalString(input.get("linkedinUrl"));

  if (fullName.length < 2) return { ok: false, message: "Full name is too short." };
  if (bio.length < 40) return { ok: false, message: "Bio must be at least 40 characters." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      fullName,
      bio,
      avatarUrl,
      phoneNumber,
      mentorHeadline,
      mentorSpecialties,
      mentorYearsExperience,
      country,
      state,
      city,
      addressLine1,
      addressLine2,
      postalCode,
      websiteUrl,
      linkedinUrl,
    },
    select: { id: true },
  });

  revalidateMentorPortal();
  return { ok: true };
}

export async function submitMentorProfileAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.MENTOR) {
    return { ok: false, message: "Unauthorized." };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      phoneNumber: true,
      country: true,
      state: true,
      city: true,
      addressLine1: true,
      mentorProfileSubmittedAt: true,
    },
  });
  if (!user) return { ok: false, message: "Account not found." };
  if (user.mentorProfileSubmittedAt) {
    return { ok: false, message: "Profile already submitted." };
  }

  const fullName = user.fullName.trim();
  const bio = (user.bio ?? "").trim();
  const avatarUrl = (user.avatarUrl ?? "").trim();
  if (fullName.length < 2) return { ok: false, message: "Full name is required." };
  if (bio.length < 40) return { ok: false, message: "Bio must be at least 40 characters." };
  if (avatarUrl.length < 6) return { ok: false, message: "Profile photo is required." };
  if (!user.phoneNumber?.trim()) return { ok: false, message: "Phone number is required." };
  if (!user.country?.trim()) return { ok: false, message: "Country is required." };
  if (!user.state?.trim()) return { ok: false, message: "State is required." };
  if (!user.city?.trim()) return { ok: false, message: "City is required." };
  if (!user.addressLine1?.trim()) return { ok: false, message: "Address line 1 is required." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      mentorProfileSubmittedAt: new Date(),
      mentorProfileStatus: MentorProfileStatus.PENDING_REVIEW,
      mentorReviewRequestedAt: new Date(),
    },
    select: { id: true },
  });

  void notifyAdminsMentorProfileSubmitted(session.user.id);

  revalidateMentorPortal();
  revalidateAdminPortal();
  return { ok: true };
}
