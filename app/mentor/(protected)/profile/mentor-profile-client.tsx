"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import {
  ProfileEditorHeader,
  ProfileEditorRoot,
  ProfileFormFooter,
  ProfileReadOnlySwitchRow,
  ProfileSegment,
  ProfileTextareaField,
  ProfileTextField,
} from "@/components/profile/profile-editor-shell";
import { ProfileSettingsTabs } from "@/components/profile/profile-settings-tabs";
import { MentorProfileStatus } from "@/generated/prisma/enums";
import { mentorVisibleToStudents } from "@/lib/auth/mentor-profile-visibility";
import {
  submitMentorProfileAction,
  updateMentorProfileAction,
} from "./actions";
import type { MentorProfileRow } from "./types";

export function MentorProfileClient({
  user,
  avatarPreviewSrc,
}: {
  user: MentorProfileRow;
  avatarPreviewSrc: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");

  useEffect(() => {
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user.avatarUrl]);

  function submitUpdate(fd: FormData) {
    fd.set("avatarUrl", avatarUrl.trim());
    const tid = toast.loading("Saving profile…");
    startTransition(async () => {
      const res = await updateMentorProfileAction(fd);
      if (!res.ok) {
        toast.error(res.message, { id: tid });
        return;
      }
      toast.success("Profile saved.", { id: tid });
      refreshPortalAfterMutation(router);
    });
  }

  function submitProfile() {
    const tid = toast.loading("Submitting profile…");
    startTransition(async () => {
      const res = await submitMentorProfileAction();
      if (!res.ok) {
        toast.error(res.message, { id: tid });
        return;
      }
      toast.success("Profile submitted for admin review.", {
        id: tid,
      });
      refreshPortalAfterMutation(router);
    });
  }

  const submitted = Boolean(user.mentorProfileSubmittedAt);
  const visibleToStudents = mentorVisibleToStudents(
    user.mentorProfileStatus as MentorProfileStatus,
  );
  const statusLabel =
    user.mentorProfileStatus === MentorProfileStatus.APPROVED
      ? "Approved"
      : user.mentorProfileStatus === MentorProfileStatus.PENDING_REVIEW
        ? "Pending review"
        : user.mentorProfileStatus === MentorProfileStatus.REJECTED
          ? "Needs updates"
          : submitted
            ? "Submitted"
            : "Not submitted";

  return (
    <ProfileEditorRoot className="max-w-3xl">
      <ProfileEditorHeader
        title="Settings"
        description="Complete your profile and submit it for review. Student directory listing requires admin approval — your dashboard is always available."
      />

      <div className="sticky top-0 z-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-sm)] sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Submit for review
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Save your changes, then submit once all requirements are met. An
              admin will activate your profile for student booking.
            </p>
            <p className="text-xs font-medium text-[var(--foreground)]">
              Status: {statusLabel}
            </p>
          </div>
          <ButtonRow
            pending={pending}
            submitted={submitted}
            onSubmit={submitProfile}
          />
        </div>
      </div>

      <form action={submitUpdate} className="space-y-8">
        <ProfileSettingsTabs
          defaultTabId="account"
          tabs={[
            {
              id: "account",
              label: "Account",
              content: (
                <ProfileSegment
                  title="Profile verification"
                  description="Controls whether students can find you in the mentor directory."
                >
                  <ProfileReadOnlySwitchRow
                    label="Visible to students"
                    description={
                      visibleToStudents
                        ? "Your mentor profile is approved and listed for students."
                        : "Students cannot find you in the directory until your profile is approved."
                    }
                    on={visibleToStudents}
                  />
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {statusLabel}
                  </p>
                  {submitted ? (
                    <p className="text-xs text-muted-foreground">
                      Submitted:{" "}
                      {new Date(
                        user.mentorProfileSubmittedAt as string,
                      ).toLocaleString()}
                    </p>
                  ) : null}
                </ProfileSegment>
              ),
            },
            {
              id: "profile",
              label: "Profile",
              content: (
                <ProfileSegment
                  title="Personal information"
                  description="Identity, contact, and how you introduce yourself."
                >
                  <ProfileTextField
                    id="mentor-email"
                    name="email"
                    label="Email"
                    hint="From your account."
                    defaultValue={user.email}
                    readOnly
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="mentor-fullName"
                      name="fullName"
                      label="Full name"
                      hint="Shown on your public mentor profile."
                      defaultValue={user.fullName}
                      required
                    />
                    <ProfileTextField
                      id="mentor-phone"
                      name="phoneNumber"
                      label="Phone number"
                      hint="Required before you can submit for review."
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
                    hint="Required before you submit for review (e.g. from Google sign-in or an upload). Square images look best. Save after uploading."
                  />
                  <ProfileTextareaField
                    id="mentor-bio"
                    name="bio"
                    label="Bio"
                    hint="At least 40 characters. Tell students what you can help with."
                    defaultValue={user.bio ?? ""}
                    required
                    rows={6}
                    placeholder="Your background, coaching style, and outcomes you focus on."
                  />
                </ProfileSegment>
              ),
            },
            {
              id: "professional",
              label: "Professional",
              content: (
                <ProfileSegment
                  title="Professional"
                  description="Headline, experience, and links."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="mentor-headline"
                      name="mentorHeadline"
                      label="Headline"
                      hint="Short positioning line."
                      defaultValue={user.mentorHeadline ?? ""}
                      placeholder="e.g., Clinical Pharmacist • Career Coach"
                    />
                    <ProfileTextField
                      id="mentor-years"
                      name="mentorYearsExperience"
                      label="Years of experience"
                      defaultValue={
                        user.mentorYearsExperience?.toString() ?? ""
                      }
                      inputMode="numeric"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <ProfileTextField
                    id="mentor-specialties"
                    name="mentorSpecialties"
                    label="Specialties"
                    hint="Comma-separated topics you support."
                    defaultValue={user.mentorSpecialties ?? ""}
                    placeholder="e.g., CV review, Residency, Interview prep"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="mentor-website"
                      name="websiteUrl"
                      label="Website URL"
                      defaultValue={user.websiteUrl ?? ""}
                      placeholder="https://…"
                    />
                    <ProfileTextField
                      id="mentor-linkedin"
                      name="linkedinUrl"
                      label="LinkedIn URL"
                      defaultValue={user.linkedinUrl ?? ""}
                      placeholder="https://linkedin.com/in/…"
                    />
                  </div>
                </ProfileSegment>
              ),
            },
            {
              id: "location",
              label: "Location",
              content: (
                <ProfileSegment
                  title="Location"
                  description="Required fields must be filled before you submit for review."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="mentor-country"
                      name="country"
                      label="Country"
                      defaultValue={user.country ?? ""}
                    />
                    <ProfileTextField
                      id="mentor-state"
                      name="state"
                      label="State / region"
                      defaultValue={user.state ?? ""}
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileTextField
                      id="mentor-city"
                      name="city"
                      label="City"
                      defaultValue={user.city ?? ""}
                    />
                    <ProfileTextField
                      id="mentor-postal"
                      name="postalCode"
                      label="Postal code"
                      defaultValue={user.postalCode ?? ""}
                    />
                  </div>
                  <ProfileTextField
                    id="mentor-address1"
                    name="addressLine1"
                    label="Address line 1"
                    defaultValue={user.addressLine1 ?? ""}
                  />
                  <ProfileTextField
                    id="mentor-address2"
                    name="addressLine2"
                    label="Address line 2 (optional)"
                    defaultValue={user.addressLine2 ?? ""}
                  />
                </ProfileSegment>
              ),
            },
          ]}
        />

        <ProfileFormFooter
          cancelHref="/mentor/dashboard"
          cancelLabel="Cancel"
          saveLabel="Save profile"
          pending={pending}
        />
      </form>
    </ProfileEditorRoot>
  );
}

function ButtonRow({
  pending,
  submitted,
  onSubmit,
}: {
  pending: boolean;
  submitted: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
      <button
        type="button"
        disabled={pending || submitted}
        onClick={() => onSubmit()}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity disabled:opacity-50"
      >
        {submitted ? "Profile submitted" : "Submit profile"}
      </button>
      {!submitted ? (
        <span className="text-xs text-muted-foreground sm:max-w-[12rem]">
          Admin activation is required before students can book you.
        </span>
      ) : null}
    </div>
  );
}
