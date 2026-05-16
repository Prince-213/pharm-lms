"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { TutorPayoutAccountEditor } from "@/components/mentor/tutor-payout-account-editor";
import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import {
  ProfileEditorHeader,
  ProfileEditorRoot,
  ProfileFormFooter,
  ProfileSegment,
  ProfileTextareaField,
  ProfileTextField,
} from "@/components/profile/profile-editor-shell";
import { ProfileSettingsTabs } from "@/components/profile/profile-settings-tabs";
import { updateTutorProfileAction } from "./actions";
import type { TutorPayoutSummary, TutorProfileRow } from "./types";

export function TutorProfileClient({
  user,
  avatarPreviewSrc,
  payoutSummary,
  initialSettingsTab,
}: {
  user: TutorProfileRow;
  avatarPreviewSrc: string | null;
  payoutSummary: TutorPayoutSummary | null;
  initialSettingsTab?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");

  useEffect(() => {
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user.avatarUrl]);

  function onSubmit(fd: FormData) {
    fd.set("avatarUrl", avatarUrl.trim());
    const tid = toast.loading("Saving profile…");
    startTransition(async () => {
      const res = await updateTutorProfileAction(fd);
      if (!res.ok) {
        toast.error(res.message, { id: tid });
        return;
      }
      toast.success("Profile saved.", { id: tid });
      router.refresh();
    });
  }

  return (
    <ProfileEditorRoot className="max-w-3xl">
      <ProfileEditorHeader
        title="Settings"
        description="Information here appears on your course instructor profile when students book meetings. Sign-in email stays tied to your account."
      />

      <form action={onSubmit} className="space-y-8">
        <ProfileSettingsTabs
          defaultTabId={initialSettingsTab}
          tabs={[
            {
              id: "profile",
              label: "Profile",
              content: (
                <ProfileSegment
                  title="Personal information"
                  description="Identity and how you introduce yourself to learners."
                >
                  <ProfileTextField
                    id="tutor-email"
                    name="email"
                    label="Email"
                    hint="From your account. Contact support to change."
                    defaultValue={user.email}
                    readOnly
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="tutor-fullName"
                      name="fullName"
                      label="Full name"
                      hint="Shown as your display name on meeting booking."
                      defaultValue={user.fullName}
                      required
                    />
                    <ProfileTextField
                      id="tutor-phone"
                      name="phoneNumber"
                      label="Phone number"
                      hint="Optional; useful if students need to reach you about a session."
                      defaultValue={user.phoneNumber ?? ""}
                      placeholder="+234…"
                    />
                  </div>
                  <ProfileAvatarPicker
                    fullName={user.fullName}
                    serverAvatarUrl={user.avatarUrl}
                    resolvedPreviewSrc={avatarPreviewSrc}
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    hint="Shown on your booking profile. Square images look best. Upload replaces your stored photo when you save."
                  />
                  <ProfileTextareaField
                    id="tutor-bio"
                    name="bio"
                    label="Bio"
                    hint="At least 30 characters. Students read this on your instructor profile before booking."
                    defaultValue={user.bio ?? ""}
                    required
                    rows={6}
                    placeholder="Your background, teaching style, and how you help students."
                  />
                </ProfileSegment>
              ),
            },
            {
              id: "contact",
              label: "Professional & location",
              content: (
                <>
                  <ProfileSegment
                    title="Professional"
                    description="Helps students understand your expertise beyond a single course."
                  >
                    <ProfileTextField
                      id="tutor-headline"
                      name="mentorHeadline"
                      label="Professional headline"
                      hint="Short line under your name, e.g. role and focus areas."
                      defaultValue={user.mentorHeadline ?? ""}
                      placeholder="e.g., Clinical pharmacist · Exam prep & case discussions"
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="tutor-specialties"
                        name="mentorSpecialties"
                        label="Focus areas"
                        hint="Comma-separated topics you emphasize."
                        defaultValue={user.mentorSpecialties ?? ""}
                        placeholder="e.g., Calculations, OSCE, Board prep"
                      />
                      <ProfileTextField
                        id="tutor-years"
                        name="mentorYearsExperience"
                        label="Years of experience"
                        defaultValue={
                          user.mentorYearsExperience?.toString() ?? ""
                        }
                        inputMode="numeric"
                        placeholder="e.g., 8"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="tutor-website"
                        name="websiteUrl"
                        label="Website"
                        defaultValue={user.websiteUrl ?? ""}
                        placeholder="https://…"
                      />
                      <ProfileTextField
                        id="tutor-linkedin"
                        name="linkedinUrl"
                        label="LinkedIn"
                        defaultValue={user.linkedinUrl ?? ""}
                        placeholder="https://linkedin.com/in/…"
                      />
                    </div>
                  </ProfileSegment>

                  <ProfileSegment
                    title="Location"
                    description="Optional; can support verification or local scheduling context."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="tutor-country"
                        name="country"
                        label="Country"
                        defaultValue={user.country ?? ""}
                      />
                      <ProfileTextField
                        id="tutor-state"
                        name="state"
                        label="State / region"
                        defaultValue={user.state ?? ""}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="tutor-city"
                        name="city"
                        label="City"
                        defaultValue={user.city ?? ""}
                      />
                      <ProfileTextField
                        id="tutor-postal"
                        name="postalCode"
                        label="Postal code"
                        defaultValue={user.postalCode ?? ""}
                      />
                    </div>
                    <ProfileTextField
                      id="tutor-address1"
                      name="addressLine1"
                      label="Address line 1"
                      defaultValue={user.addressLine1 ?? ""}
                    />
                    <ProfileTextField
                      id="tutor-address2"
                      name="addressLine2"
                      label="Address line 2 (optional)"
                      defaultValue={user.addressLine2 ?? ""}
                    />
                  </ProfileSegment>
                </>
              ),
            },
            {
              id: "accounts",
              label: "Accounts",
              content: (
                <ProfileSegment
                  title="Payout account"
                  description="Bank details used when you request withdrawals from the Payouts page."
                >
                  <TutorPayoutAccountEditor payoutSummary={payoutSummary} />
                </ProfileSegment>
              ),
            },
          ]}
        />

        <ProfileFormFooter
          cancelHref="/tutor/courses"
          cancelLabel="Cancel"
          saveLabel="Save profile"
          pending={pending}
        />
      </form>
    </ProfileEditorRoot>
  );
}
