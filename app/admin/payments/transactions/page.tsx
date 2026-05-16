import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminPaymentsTransactionsClient } from "@/components/admin/admin-payments-transactions-client";

export default function AdminPaymentsTransactionsPage() {
  return (
    <AdminPanel
      title="Transactions"
      description="Successful and pending student checkouts. Filter by tutor, course, status, or creation date."
    >
      <AdminPaymentsTransactionsClient />
    </AdminPanel>
  );
}
