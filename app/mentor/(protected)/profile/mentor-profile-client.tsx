"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  ProfileEditorHeader,
  ProfileEditorRoot,
  ProfileFormFooter,
  ProfileReadOnlySwitchRow,
  ProfileSegment,
  ProfileTextareaField,
  ProfileTextField,
} from "@/components/profile/profile-editor-shell";
import {
  submitMentorProfileAction,
  updateMentorProfileAction,
} from "./actions";
import type { MentorProfileRow } from "./types";

export function MentorProfileClient({ user }: { user: MentorProfileRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function submitUpdate(fd: FormData) {
    const tid = toast.loading("Saving profile…");
    startTransition(async () => {
      const res = await updateMentorProfileAction(fd);
      if (!res.ok) {
        toast.error(res.message, { id: tid });
        return;
      }
      toast.success("Profile saved.", { id: tid });
      router.refresh();
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
      toast.success("Profile submitted. Waiting for admin activation.", {
        id: tid,
      });
      router.refresh();
    });
  }

  const submitted = Boolean(user.mentorProfileSubmittedAt);

  return (
    <ProfileEditorRoot>
      <ProfileEditorHeader
        title="Profile"
        description="Complete your profile and submit it for review. Your account becomes visible to students after an admin activates it."
      />

      <ProfileSegment
        title="Account status"
        description="Visibility and review state."
      >
        <ProfileReadOnlySwitchRow
          label="Visible to students"
          description={
            user.isActive
              ? "Your mentor profile is active and bookable."
              : "Students cannot book you until an admin activates your account."
          }
          on={user.isActive}
        />
        <p className="text-sm font-medium text-[var(--foreground)]">
          {user.isActive
            ? "Active"
            : submitted
              ? "Pending activation"
              : "Profile not submitted"}
        </p>
        {submitted ? (
          <p className="text-xs text-[var(--muted)]">
            Submitted:{" "}
            {new Date(user.mentorProfileSubmittedAt as string).toLocaleString()}
          </p>
        ) : null}
      </ProfileSegment>

      <form action={submitUpdate} className="space-y-8">
        <ProfileSegment
          title="Bio data"
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
          <ProfileTextField
            id="mentor-avatar"
            name="avatarUrl"
            label="Profile photo URL"
            hint="Direct image link. Required before submit for review."
            defaultValue={user.avatarUrl ?? ""}
            placeholder="https://…"
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
              defaultValue={user.mentorYearsExperience?.toString() ?? ""}
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

        <ProfileFormFooter
          cancelHref="/mentor/dashboard"
          cancelLabel="Cancel"
          saveLabel="Save profile"
          pending={pending}
        />
      </form>

      <ProfileSegment
        title="Submit for review"
        description="After saving, submit once you meet all requirements. An admin will activate your profile for student booking."
      >
        <ButtonRow
          pending={pending}
          submitted={submitted}
          onSubmit={submitProfile}
        />
      </ProfileSegment>
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
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending || submitted}
        onClick={() => onSubmit()}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity disabled:opacity-50"
      >
        {submitted ? "Profile submitted" : "Submit profile"}
      </button>
      {!submitted ? (
        <span className="text-xs text-[var(--muted)]">
          Admin activation is required before students can book you.
        </span>
      ) : null}
    </div>
  );
}
