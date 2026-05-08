import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  approveMentorApplicationAction,
  rejectMentorApplicationAction,
} from "@/app/admin/mentor-applications/actions";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

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
      mentorReviewRequestedAt: true,
    },
    take: 100,
  });

  return (
    <>
      <AdminPageHeader
        title="Mentor applications"
        description="Review new mentor profiles before they become visible to students."
      />

      <AdminPanel
        title="Pending review"
        description="Approve to list mentors in the student directory, or reject with a note."
      >
        {pending.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((m) => (
                  <tr key={m.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-[var(--foreground)]">
                        {m.fullName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{m.email}</p>
                      <p className="mt-2 line-clamp-4 text-xs text-[var(--muted)]">
                        {m.bio?.trim() || "No bio provided."}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-[var(--muted)]">
                      {m.mentorReviewRequestedAt
                        ? new Date(m.mentorReviewRequestedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <form
                          action={async () => {
                            "use server";
                            await approveMentorApplicationAction(m.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)]"
                          >
                            Approve
                          </button>
                        </form>
                        <form
                          action={async (fd: FormData) => {
                            "use server";
                            const note = String(fd.get("note") ?? "");
                            await rejectMentorApplicationAction(m.id, note);
                          }}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <input
                            name="note"
                            placeholder="Rejection note (optional)"
                            className="h-9 w-64 rounded border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
                          />
                          <button
                            type="submit"
                            className="rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No pending applications.</p>
        )}
      </AdminPanel>
    </>
  );
}

