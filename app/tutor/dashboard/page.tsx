import { redirect } from "next/navigation";

/** Tutor workspace home: course list */
export default function TutorDashboardRedirectPage() {
  redirect("/tutor/courses");
}
