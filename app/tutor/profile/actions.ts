"use server";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import {
  isTutorProfileComplete,
  TUTOR_BIO_MIN_LENGTH,
} from "@/lib/auth/tutor-profile-completion";
import { db } from "@/lib/db";

type ActionResult =
  | { ok: true; profileComplete: boolean }
  | { ok: false; message: string };

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

export async function updateTutorProfileAction(
  input: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return { ok: false, message: "Unauthorized." };
  }

  const fullName = String(input.get("fullName") ?? "").trim();
  const bio = String(input.get("bio") ?? "").trim();
  const avatarUrl = asOptionalString(input.get("avatarUrl"));
  const phoneNumber = asOptionalString(input.get("phoneNumber"));
  const mentorHeadline = asOptionalString(input.get("mentorHeadline"));
  const mentorSpecialties = asOptionalString(input.get("mentorSpecialties"));
  const mentorYearsExperience = asOptionalInt(
    input.get("mentorYearsExperience"),
  );
  const country = asOptionalString(input.get("country"));
  const state = asOptionalString(input.get("state"));
  const city = asOptionalString(input.get("city"));
  const addressLine1 = asOptionalString(input.get("addressLine1"));
  const addressLine2 = asOptionalString(input.get("addressLine2"));
  const postalCode = asOptionalString(input.get("postalCode"));
  const websiteUrl = asOptionalString(input.get("websiteUrl"));
  const linkedinUrl = asOptionalString(input.get("linkedinUrl"));

  if (fullName.length < 2)
    return { ok: false, message: "Full name is too short." };
  if (bio.length < TUTOR_BIO_MIN_LENGTH) {
    return {
      ok: false,
      message: `Bio must be at least ${TUTOR_BIO_MIN_LENGTH} characters so students know what to expect.`,
    };
  }

  const complete = isTutorProfileComplete({
    fullName,
    bio,
    avatarUrl,
    phoneNumber,
    country,
    state,
    city,
    addressLine1,
  });

  const existing = await db.user.findUnique({
    where: { id: session.user.id },
    select: { tutorProfileCompletedAt: true, isActive: true },
  });
  if (!existing) return { ok: false, message: "Account not found." };

  const now = new Date();
  const newlyComplete = complete && !existing.tutorProfileCompletedAt;

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
      tutorProfileCompletedAt: complete
        ? (existing.tutorProfileCompletedAt ?? now)
        : null,
      ...(newlyComplete || (complete && !existing.isActive)
        ? { isActive: true }
        : {}),
    },
    select: { id: true },
  });

  return { ok: true, profileComplete: complete };
}
