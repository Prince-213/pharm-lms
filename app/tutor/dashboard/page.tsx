import { redirect } from "next/navigation";

/** Performance analytics moved to /mentor/performance */
export default function MentorDashboardRedirectPage() {
  redirect("/mentor/performance");
}
