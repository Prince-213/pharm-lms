import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPaymentsSubnav } from "@/components/admin/admin-payments-subnav";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminPaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Course checkouts, tutor withdrawals, and platform fee configuration."
      />
      <AdminPaymentsSubnav />
      {children}
    </div>
  );
}
