import { redirect } from "next/navigation";

/** Performance analytics under /tutor/performance */
export default function MentorDashboardRedirectPage() {
  redirect("/tutor/performance");
}
