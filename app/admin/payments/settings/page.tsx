import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminPaymentsSettingsClient } from "@/components/admin/admin-payments-settings-client";

export default function AdminPaymentsSettingsPage() {
  return (
    <AdminPanel
      title="Payment settings"
      description="Values applied to new successful checkouts and tutor withdrawal rules."
    >
      <AdminPaymentsSettingsClient />
    </AdminPanel>
  );
}
