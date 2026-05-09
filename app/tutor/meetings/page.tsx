import { redirect } from "next/navigation";

/** Use Communication → Meetings for the full UI. */
export default function MentorMeetingsLegacyRedirectPage() {
  redirect("/tutor/communication/meetings");
}
