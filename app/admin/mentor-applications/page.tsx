import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  approveMentorApplicationAction,
  rejectMentorApplicationAction,
} from "@/app/admin/mentor-applications/actions";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export default async function AdminMentorApplicationsPage() {
  await requireAdminSession();

  const pending = await db.user.findMany({
    where: {
      role: UserRole.MENTOR,
      mentorProfileStatus: MentorProfileStatus.PENDING_REVIEW,
    },
    orderBy: { mentorReviewRequestedAt: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      mentorSpecialties: true,
      phoneNumber: true,
      country: true,
      city: true,
      mentorReviewRequestedAt: true,
    },
    take: 100,
  });

  const cards = await Promise.all(
    pending.map(async (m) => ({
      ...m,
      avatarSrc: await resolveMediaUrl(m.avatarUrl),
    })),
  );

  return (
    <>
      <AdminPageHeader
        title="Mentor applications"
        description="Pending activation queue — approve to list mentors for students, or reject so they can update and resubmit."
      />

      <p className="mb-4 text-sm text-muted-foreground">
        You can also activate mentors from the{" "}
        <Link
          href="/admin/mentors"
          className="font-semibold text-[var(--primary-strong)] hover:underline"
        >
          Mentors CRM
        </Link>
        .
      </p>

      <AdminPanel
        title="Pending activation"
        description={`${cards.length} mentor${cards.length === 1 ? "" : "s"} waiting for review. Approval activates their student directory listing.`}
      >
        {cards.length ? (
          <ul className="grid gap-4 lg:grid-cols-2">
            {cards.map((m) => (
              <li
                key={m.id}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[var(--surface-muted)] ring-1 ring-[var(--border)]">
                    {m.avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element -- resolved storage/CDN URLs vary by env
                      <img
                        src={m.avatarSrc}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {m.fullName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--foreground)]">{m.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    {m.mentorHeadline ? (
                      <p className="mt-1 text-xs font-medium text-[var(--foreground)]">
                        {m.mentorHeadline}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Submitted{" "}
                      {m.mentorReviewRequestedAt
                        ? new Date(m.mentorReviewRequestedAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <span className="h-fit shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950 ring-1 ring-amber-200">
                    Pending activation
                  </span>
                </div>

                <dl className="mt-3 grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
                  {m.phoneNumber ? (
                    <div>
                      <dt className="inline font-semibold text-[var(--foreground)]">Phone: </dt>
                      <dd className="inline">{m.phoneNumber}</dd>
                    </div>
                  ) : null}
                  {m.city || m.country ? (
                    <div>
                      <dt className="inline font-semibold text-[var(--foreground)]">Location: </dt>
                      <dd className="inline">
                        {[m.city, m.country].filter(Boolean).join(", ")}
                      </dd>
                    </div>
                  ) : null}
                  {m.mentorSpecialties ? (
                    <div className="sm:col-span-2">
                      <dt className="inline font-semibold text-[var(--foreground)]">
                        Specialties:{" "}
                      </dt>
                      <dd className="inline">{m.mentorSpecialties}</dd>
                    </div>
                  ) : null}
                </dl>

                <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                  {m.bio?.trim() || "No bio provided."}
                </p>

                <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <form
                    action={async () => {
                      "use server";
                      await approveMentorApplicationAction(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-foreground)]"
                    >
                      Approve &amp; activate
                    </button>
                  </form>
                  <form
                    action={async (fd: FormData) => {
                      "use server";
                      const note = String(fd.get("note") ?? "");
                      await rejectMentorApplicationAction(m.id, note);
                    }}
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                  >
                    <input
                      name="note"
                      placeholder="Rejection note (optional)"
                      className="h-9 min-w-[12rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No mentors are waiting for activation. New submissions appear here after
            mentors complete and submit their profiles.
          </p>
        )}
      </AdminPanel>
    </>
  );
}
