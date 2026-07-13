import { AdminPortalShell } from "@/app/admin/admin-portal-shell";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}
