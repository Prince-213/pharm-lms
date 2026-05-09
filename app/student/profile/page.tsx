import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

async function updateStudentProfileAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/profile");
  if (session.user.role !== UserRole.STUDENT) redirect(roleHomePath(session.user.role));

  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 80);
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim().slice(0, 500);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 4000);

  if (fullName.length < 2) return;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      fullName,
      avatarUrl: avatarUrl || null,
      bio: bio || null,
    },
  });

  redirect("/student/profile");
}

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/profile");
  if (session.user.role !== UserRole.STUDENT) redirect(roleHomePath(session.user.role));

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, fullName: true, bio: true, avatarUrl: true },
  });
  if (!user) redirect("/student/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Update your personal information.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Profile details
        </h2>
        <form action={updateStudentProfileAction} className="mt-4 space-y-4">
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
              placeholder="Tell us about yourself."
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
    </div>
  );
}

