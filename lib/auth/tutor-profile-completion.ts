export type TutorProfileCompletionFields = {
  fullName: string | null | undefined;
  bio: string | null | undefined;
  avatarUrl: string | null | undefined;
  phoneNumber: string | null | undefined;
  country: string | null | undefined;
  state: string | null | undefined;
  city: string | null | undefined;
  addressLine1: string | null | undefined;
};

export const TUTOR_BIO_MIN_LENGTH = 30;

export type TutorProfileChecklistItem = {
  key: keyof TutorProfileCompletionFields;
  label: string;
  done: boolean;
};

export function getTutorProfileChecklist(
  fields: TutorProfileCompletionFields,
): TutorProfileChecklistItem[] {
  const fullName = (fields.fullName ?? "").trim();
  const bio = (fields.bio ?? "").trim();
  const avatarUrl = (fields.avatarUrl ?? "").trim();

  return [
    {
      key: "fullName",
      label: "Full name",
      done: fullName.length >= 2,
    },
    {
      key: "bio",
      label: `Bio (${TUTOR_BIO_MIN_LENGTH}+ characters)`,
      done: bio.length >= TUTOR_BIO_MIN_LENGTH,
    },
    {
      key: "avatarUrl",
      label: "Profile photo",
      done: avatarUrl.length >= 6,
    },
    {
      key: "phoneNumber",
      label: "Phone number",
      done: Boolean(fields.phoneNumber?.trim()),
    },
    {
      key: "country",
      label: "Country",
      done: Boolean(fields.country?.trim()),
    },
    {
      key: "state",
      label: "State / region",
      done: Boolean(fields.state?.trim()),
    },
    {
      key: "city",
      label: "City",
      done: Boolean(fields.city?.trim()),
    },
    {
      key: "addressLine1",
      label: "Address",
      done: Boolean(fields.addressLine1?.trim()),
    },
  ];
}

export function isTutorProfileComplete(
  fields: TutorProfileCompletionFields,
): boolean {
  return getTutorProfileChecklist(fields).every((item) => item.done);
}

export function tutorDirectoryEligible(input: {
  isActive: boolean;
  tutorProfileCompletedAt: Date | string | null | undefined;
}): boolean {
  return Boolean(input.isActive && input.tutorProfileCompletedAt);
}

export type TutorAccountDisplayStatus =
  | "incomplete"
  | "active"
  | "inactive";

export function resolveTutorAccountDisplayStatus(input: {
  isActive: boolean;
  tutorProfileCompletedAt: Date | string | null | undefined;
}): TutorAccountDisplayStatus {
  if (!input.isActive) return "inactive";
  if (!input.tutorProfileCompletedAt) return "incomplete";
  return "active";
}

export function tutorAccountDisplayLabel(
  status: TutorAccountDisplayStatus,
): string {
  switch (status) {
    case "incomplete":
      return "Setup incomplete";
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
  }
}
