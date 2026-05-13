"use server";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

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

export async function updateStudentProfileAction(
  input: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Unauthorized." };
  }

  const fullName = String(input.get("fullName") ?? "").trim();
  const bioRaw = String(input.get("bio") ?? "").trim();
  const bio = bioRaw.length ? bioRaw : null;
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

  if (fullName.length < 2) {
    return { ok: false, message: "Full name is too short." };
  }

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

  return { ok: true };
}
