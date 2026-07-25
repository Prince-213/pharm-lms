import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminUsersPage() {
  await requireAdminSession();

  return (
    <>
      <AdminPageHeader
        title="People"
        description="Manage learner, tutor, and mentor accounts from the CRM directories below."
      />
      <AdminPanel title="Directories">
        <ul className="grid gap-3 sm:grid-cols-3">
          <li>
            <Link
              href="/admin/students"
              className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 font-semibold hover:border-primary"
            >
              Students
            </Link>
          </li>
          <li>
            <Link
              href="/admin/tutors"
              className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 font-semibold hover:border-primary"
            >
              Tutors
            </Link>
          </li>
          <li>
            <Link
              href="/admin/mentors"
              className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 font-semibold hover:border-primary"
            >
              Mentors
            </Link>
          </li>
        </ul>
      </AdminPanel>
    </>
  );
}
