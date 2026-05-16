import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminPaymentsWithdrawalsClient } from "@/components/admin/admin-payments-withdrawals-client";

export default function AdminPaymentsWithdrawalsPage() {
  return (
    <AdminPanel
      title="Withdrawals"
      description="Tutor cash-out requests. Approving triggers a Paystack transfer from your platform balance."
    >
      <AdminPaymentsWithdrawalsClient />
    </AdminPanel>
  );
}
