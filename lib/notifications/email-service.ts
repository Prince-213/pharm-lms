import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function redactEmail(to: string): string {
  const [local, domain] = to.split("@");
  if (!domain) return "***";
  const safeLocal = local.length <= 0 ? "*" : `${local[0] ?? "*"}***`;
  return `${safeLocal}@${domain}`;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const redacted = redactEmail(to);

  if (!resend) {
    console.log(
      `[email-service] MOCK (no RESEND_API_KEY) to=${redacted} subject="${subject}"`,
    );
    console.log("[email-service] MOCK body (OTP is in HTML below):");
    console.log(html);
    console.log("[email-service] MOCK end");
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
      console.error(
        `[email-service] resend_send failed to=${redacted} subject="${subject}"`,
        error,
      );
      return { success: false, error };
    }

    const messageId =
      data && typeof data === "object" && "id" in data
        ? String((data as { id: unknown }).id)
        : undefined;
    console.log(
      `[email-service] resend_send ok to=${redacted} id=${messageId ?? "unknown"}`,
    );

    return { success: true, data };
  } catch (error) {
    console.error(
      `[email-service] resend_send exception to=${redacted}`,
      error,
    );
    return { success: false, error };
  }
}
