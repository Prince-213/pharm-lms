"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { MentorProfileRow } from "./types";
import { submitMentorProfileAction, updateMentorProfileAction } from "./actions";

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
      toast.success("Profile submitted. Waiting for admin activation.", { id: tid });
      router.refresh();
    });
  }

  const submitted = Boolean(user.mentorProfileSubmittedAt);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Complete your profile and submit it for review. Your account becomes visible to students after an admin activates it.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Status
        </p>
        <p className="mt-1 text-sm font-semibold">
          {user.isActive ? "Active (visible to students)" : submitted ? "Pending activation" : "Profile not submitted"}
        </p>
        {submitted ? (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Submitted: {new Date(user.mentorProfileSubmittedAt as string).toLocaleString()}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-bold">Basic information</h2>
        <form action={submitUpdate} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">Email</span>
            <input
              value={user.email}
              readOnly
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Full name
              </span>
              <input
                name="fullName"
                defaultValue={user.fullName}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Phone number
              </span>
              <input
                name="phoneNumber"
                defaultValue={user.phoneNumber ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                placeholder="+234…"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Headline
              </span>
              <input
                name="mentorHeadline"
                defaultValue={user.mentorHeadline ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                placeholder="e.g., Clinical Pharmacist • Career Coach"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Years of experience
              </span>
              <input
                name="mentorYearsExperience"
                defaultValue={user.mentorYearsExperience?.toString() ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                inputMode="numeric"
                placeholder="e.g., 5"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Specialties (comma-separated)
            </span>
            <input
              name="mentorSpecialties"
              defaultValue={user.mentorSpecialties ?? ""}
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              placeholder="e.g., CV review, Residency, Interview prep"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Profile photo URL
            </span>
            <input
              name="avatarUrl"
              defaultValue={user.avatarUrl ?? ""}
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              placeholder="https://..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Website URL
              </span>
              <input
                name="websiteUrl"
                defaultValue={user.websiteUrl ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                placeholder="https://…"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                LinkedIn URL
              </span>
              <input
                name="linkedinUrl"
                defaultValue={user.linkedinUrl ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                placeholder="https://linkedin.com/in/…"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Country
              </span>
              <input
                name="country"
                defaultValue={user.country ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                State
              </span>
              <input
                name="state"
                defaultValue={user.state ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                City
              </span>
              <input
                name="city"
                defaultValue={user.city ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Postal code
              </span>
              <input
                name="postalCode"
                defaultValue={user.postalCode ?? ""}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Address line 1
            </span>
            <input
              name="addressLine1"
              defaultValue={user.addressLine1 ?? ""}
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Address line 2 (optional)
            </span>
            <input
              name="addressLine2"
              defaultValue={user.addressLine2 ?? ""}
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">Bio</span>
            <textarea
              name="bio"
              defaultValue={user.bio ?? ""}
              rows={6}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Tell students what you can help with (min. 40 characters)."
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
          >
            Save profile
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-bold">Submit profile</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Submit your profile for admin review. Once activated, students can view your profile and book meetings.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending || submitted}
            onClick={() => submitProfile()}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
          >
            {submitted ? "Profile submitted" : "Submit profile"}
          </button>
          {!user.isActive ? (
            <span className="self-center text-xs text-[var(--muted)]">
              Admin activation is required before students can book you.
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}

