"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import {
  getTutorProfileChecklist,
  isTutorProfileComplete,
  TUTOR_BIO_MIN_LENGTH,
} from "@/lib/auth/tutor-profile-completion";
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

  const checklist = useMemo(
    () =>
      getTutorProfileChecklist({
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl ?? avatarUrl,
        phoneNumber: user.phoneNumber,
        country: user.country,
        state: user.state,
        city: user.city,
        addressLine1: user.addressLine1,
      }),
    [user, avatarUrl],
  );

  const profileLive = Boolean(user.tutorProfileCompletedAt);
  const fieldsLookComplete = isTutorProfileComplete({
    fullName: user.fullName,
    bio: user.bio,
    avatarUrl: user.avatarUrl ?? avatarUrl,
    phoneNumber: user.phoneNumber,
    country: user.country,
    state: user.state,
    city: user.city,
    addressLine1: user.addressLine1,
  });

  function onSubmit(fd: FormData) {
    fd.set("avatarUrl", avatarUrl.trim());
    const tid = toast.loading("Saving profile…");
    startTransition(async () => {
      const res = await updateTutorProfileAction(fd);
      if (!res.ok) {
        toast.error(res.message, { id: tid });
        return;
      }
      toast.success(
        res.profileComplete
          ? "Profile complete — you are listed for students."
          : "Profile saved. Finish the checklist to appear in the tutor directory.",
        { id: tid },
      );
      router.refresh();
    });
  }

  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <ProfileEditorRoot className="max-w-3xl">
      <ProfileEditorHeader
        title="Settings"
        description="Complete the required profile fields to appear in the student tutor directory. Your account activates automatically once everything is filled in — no admin wait."
      />

      <section
        className={
          profileLive
            ? "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
            : "rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
        }
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Directory status
        </p>
        <p className="mt-1 text-sm font-semibold">
          {profileLive
            ? "Profile live — visible to students"
            : "Setup incomplete"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {profileLive
            ? "Students can find you in the tutor directory. Keep your profile up to date."
            : `Complete ${doneCount}/${checklist.length} required items, then save. Listing activates automatically.`}
        </p>
        {!profileLive ? (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {checklist.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-2 text-xs text-amber-950/90"
              >
                <span
                  className={
                    item.done
                      ? "inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white"
                      : "inline-flex h-4 w-4 items-center justify-center rounded-full border border-amber-300 bg-white text-[10px] text-amber-700"
                  }
                  aria-hidden
                >
                  {item.done ? "✓" : ""}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        ) : null}
        {!profileLive && fieldsLookComplete ? (
          <p className="mt-3 text-xs font-medium text-amber-900">
            Required fields look complete — save your profile to go live.
          </p>
        ) : null}
      </section>

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
                      hint="Required to complete your profile."
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
                    hint="Required. Square images look best. Upload replaces your stored photo when you save."
                  />
                  <ProfileTextareaField
                    id="tutor-bio"
                    name="bio"
                    label="Bio"
                    hint={`At least ${TUTOR_BIO_MIN_LENGTH} characters. Students read this before booking.`}
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
                    description="Country, region, city, and address are required for a complete profile."
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

      <p className="text-center text-xs text-muted-foreground">
        Need help?{" "}
        <Link href="/tutor/courses" className="font-semibold text-[var(--primary)] hover:underline">
          Back to courses
        </Link>
      </p>
    </ProfileEditorRoot>
  );
}
