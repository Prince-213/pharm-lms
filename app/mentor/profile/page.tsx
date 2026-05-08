import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import {
  submitMentorReviewRequestAction,
  updateMentorProfileAction,
} from "@/app/mentor/profile/actions";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorProfileStatus: true,
      mentorReviewRequestedAt: true,
      mentorReviewedAt: true,
      mentorReviewNote: true,
    },
  });
  if (!user) redirect("/mentor/login");

  const statusLabel =
    user.mentorProfileStatus === MentorProfileStatus.APPROVED
      ? "Approved"
      : user.mentorProfileStatus === MentorProfileStatus.PENDING_REVIEW
        ? "Pending admin review"
        : user.mentorProfileStatus === MentorProfileStatus.REJECTED
          ? "Rejected"
          : "Incomplete";

  const canSubmitReview = !user.mentorReviewRequestedAt;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
          Mentor profile
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Complete your profile, then submit a one-time review request to be
          listed for students.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Status
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
          {statusLabel}
        </p>
        {user.mentorReviewNote ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Admin note: {user.mentorReviewNote}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Profile details
        </h2>
        <form action={updateMentorProfileAction} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Email
            </span>
            <input
              value={user.email}
              readOnly
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm"
            />
          </label>

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
              Profile photo URL
            </span>
            <input
              name="avatarUrl"
              defaultValue={user.avatarUrl ?? ""}
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--muted)]">Bio</span>
            <textarea
              name="bio"
              defaultValue={user.bio ?? ""}
              rows={5}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Write a short bio (20+ chars)."
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Save profile
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Submit for review
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          You can submit a review request once. After approval, students will
          be able to see and book you.
        </p>
        <form action={submitMentorReviewRequestAction} className="mt-4">
          <button
            type="submit"
            disabled={!canSubmitReview}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
          >
            {canSubmitReview ? "Request admin review" : "Review request submitted"}
          </button>
        </form>
      </section>
    </div>
  );
}

