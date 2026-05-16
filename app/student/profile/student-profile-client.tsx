"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
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
import { updateStudentProfileAction } from "./actions";
import type { StudentProfileRow } from "./types";

export function StudentProfileClient({
  user,
  avatarPreviewSrc,
}: {
  user: StudentProfileRow;
  avatarPreviewSrc: string | null;
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
      const res = await updateStudentProfileAction(fd);
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
        description="Optional details help mentors and tutors recognize you. Your sign-in email stays on your account; contact support to change it."
      />

      <form action={onSubmit} className="space-y-8">
        <ProfileSettingsTabs
          tabs={[
            {
              id: "profile",
              label: "Profile",
              content: (
                <ProfileSegment
                  title="Personal information"
                  description="Identity and how you show up across the platform."
                >
                  <ProfileTextField
                    id="student-email"
                    name="email"
                    label="Email"
                    hint="From your account. Contact support to change."
                    defaultValue={user.email}
                    readOnly
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="student-fullName"
                      name="fullName"
                      label="Full name"
                      hint="Shown in meetings, forums, and on certificates where applicable."
                      defaultValue={user.fullName}
                      required
                    />
                    <ProfileTextField
                      id="student-phone"
                      name="phoneNumber"
                      label="Phone number"
                      hint="Optional; useful for session reminders."
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
                    hint="Shown across the platform. Square images look best. Upload replaces your stored photo when you save."
                  />
                  <ProfileTextareaField
                    id="student-bio"
                    name="bio"
                    label="Bio"
                    hint="Optional. A short introduction for mentors or study groups."
                    defaultValue={user.bio ?? ""}
                    rows={6}
                    placeholder="Your background, goals, or how you like to learn."
                  />
                </ProfileSegment>
              ),
            },
            {
              id: "contact",
              label: "Contact & interests",
              content: (
                <>
                  <ProfileSegment
                    title="Learning & interests"
                    description="Optional context for mentors and tutors."
                  >
                    <ProfileTextField
                      id="student-headline"
                      name="mentorHeadline"
                      label="Headline"
                      hint="One line about you, e.g. year of study or focus area."
                      defaultValue={user.mentorHeadline ?? ""}
                      placeholder="e.g., P2 student · Exam prep & clinical skills"
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="student-interests"
                        name="mentorSpecialties"
                        label="Topics of interest"
                        hint="Comma-separated areas you care about."
                        defaultValue={user.mentorSpecialties ?? ""}
                        placeholder="e.g., Calculations, OSCE, Board prep"
                      />
                      <ProfileTextField
                        id="student-years"
                        name="mentorYearsExperience"
                        label="Years in pharmacy / practice"
                        defaultValue={
                          user.mentorYearsExperience?.toString() ?? ""
                        }
                        inputMode="numeric"
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="student-website"
                        name="websiteUrl"
                        label="Website"
                        defaultValue={user.websiteUrl ?? ""}
                        placeholder="https://…"
                      />
                      <ProfileTextField
                        id="student-linkedin"
                        name="linkedinUrl"
                        label="LinkedIn"
                        defaultValue={user.linkedinUrl ?? ""}
                        placeholder="https://linkedin.com/in/…"
                      />
                    </div>
                  </ProfileSegment>

                  <ProfileSegment
                    title="Location"
                    description="Optional; can help with time zones or local offerings."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="student-country"
                        name="country"
                        label="Country"
                        defaultValue={user.country ?? ""}
                      />
                      <ProfileTextField
                        id="student-state"
                        name="state"
                        label="State / region"
                        defaultValue={user.state ?? ""}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileTextField
                        id="student-city"
                        name="city"
                        label="City"
                        defaultValue={user.city ?? ""}
                      />
                      <ProfileTextField
                        id="student-postal"
                        name="postalCode"
                        label="Postal code"
                        defaultValue={user.postalCode ?? ""}
                      />
                    </div>
                    <ProfileTextField
                      id="student-address1"
                      name="addressLine1"
                      label="Address line 1"
                      defaultValue={user.addressLine1 ?? ""}
                    />
                    <ProfileTextField
                      id="student-address2"
                      name="addressLine2"
                      label="Address line 2 (optional)"
                      defaultValue={user.addressLine2 ?? ""}
                    />
                  </ProfileSegment>
                </>
              ),
            },
          ]}
        />

        <ProfileFormFooter
          cancelHref="/student/dashboard"
          cancelLabel="Cancel"
          saveLabel="Save profile"
          pending={pending}
        />
      </form>
    </ProfileEditorRoot>
  );
}
