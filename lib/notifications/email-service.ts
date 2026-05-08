import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log("-----------------------------------------");
    console.log("DEV EMAIL (No RESEND_API_KEY Configured):");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body:");
    console.log(html);
    console.log("-----------------------------------------");
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Pharm LMS <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error };
  }
}
