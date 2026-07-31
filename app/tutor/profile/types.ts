export type TutorPayoutSummary = {
  accountName: string;
  bankCode: string;
  accountMasked: string;
  verified: boolean;
};

export type TutorProfileRow = {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  mentorHeadline: string | null;
  mentorSpecialties: string | null;
  mentorYearsExperience: number | null;
  phoneNumber: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  tutorProfileCompletedAt: string | null;
};
