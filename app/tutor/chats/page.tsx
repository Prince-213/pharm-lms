import { redirect } from "next/navigation";

/** Legacy route — Communication hub lives under /tutor/communication */
export default function MentorChatsRedirectPage() {
  redirect("/tutor/communication/messages");
}
