"use server";

import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/notifications/email-service";

const contactSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional(),
  subject: z.string().min(2).max(120),
  message: z.string().min(10).max(4000),
});

const newsletterSchema = z.object({
  email: z.string().email().max(120),
});

export type MarketingFormResult =
  | { ok: true; mocked?: boolean }
  | { ok: false; error: string };

function inboxTo(): string {
  return (
    process.env.CONTACT_INBOX_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.replace(/.*<([^>]+)>.*/, "$1").trim() ||
    "hello@pharmlms.com"
  );
}

export async function submitContactFormAction(
  input: unknown,
): Promise<MarketingFormResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fill in every field correctly." };
  }

  const limit = await checkRateLimit(`contact:${parsed.data.email.toLowerCase()}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Too many messages. Try again later." };
  }

  const { fullName, email, phone, subject, message } = parsed.data;
  const html = `
    <p><strong>New contact form message</strong></p>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "—")}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  const result = await sendEmail({
    to: inboxTo(),
    subject: `[PharmLMS Contact] ${subject}`,
    html,
  });

  if (!result.success) {
    return { ok: false, error: "Could not send your message. Try again later." };
  }

  return {
    ok: true,
    mocked: "mocked" in result ? Boolean(result.mocked) : false,
  };
}

export async function subscribeNewsletterAction(
  input: unknown,
): Promise<MarketingFormResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const email = parsed.data.email.toLowerCase();
  const limit = await checkRateLimit(`newsletter:${email}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const result = await sendEmail({
    to: inboxTo(),
    subject: "[PharmLMS] Newsletter subscription",
    html: `<p>New newsletter subscriber: <strong>${escapeHtml(email)}</strong></p>`,
  });

  if (!result.success) {
    return { ok: false, error: "Could not subscribe right now. Try again later." };
  }

  // Confirmation to the subscriber (best-effort)
  await sendEmail({
    to: email,
    subject: "You're subscribed to PharmLMS updates",
    html: `<p>Thanks for subscribing. We'll send course updates and learning tips to this address.</p>`,
  });

  return {
    ok: true,
    mocked: "mocked" in result ? Boolean(result.mocked) : false,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
