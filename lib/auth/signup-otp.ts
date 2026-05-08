"use server";

import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@/generated/prisma/enums";
import { sendEmail } from "@/lib/notifications/email-service";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 15 * 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;
const BCRYPT_ROUNDS = 4;

const emailSchema = z.string().email().toLowerCase();

const completeSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  role: z.enum([UserRole.STUDENT, UserRole.TUTOR, UserRole.MENTOR]),
});

export type OtpSendResult =
  | { ok: true }
  | { ok: false; error: string; cooldownSeconds?: number };

export type CompleteSignupResult =
  | { ok: true }
  | { ok: false; error: string };

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendSignupOtpAction(
  rawEmail: unknown,
): Promise<OtpSendResult> {
  const parsed = emailSchema.safeParse(
    typeof rawEmail === "string" ? rawEmail.trim() : "",
  );
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const email = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const lastSend = await prisma.signupOtp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (lastSend) {
    const elapsed = Date.now() - lastSend.createdAt.getTime();
    if (elapsed < SEND_COOLDOWN_MS) {
      const cooldownSeconds = Math.ceil((SEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        ok: false,
        error: `Please wait ${cooldownSeconds}s before requesting another code.`,
        cooldownSeconds,
      };
    }
  }

  await prisma.signupOtp.deleteMany({
    where: { email, consumedAt: null },
  });

  const code = generateSixDigitCode();
  const codeHash = await hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.signupOtp.create({
    data: { email, codeHash, expiresAt },
    select: { id: true },
  });

  const html = `
    <p>Your PharmLMS verification code is:</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:0.2em;">${code}</p>
    <p>This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
  `;

  const sendResult = await sendEmail({
    to: email,
    subject: "Your PharmLMS sign-up code",
    html,
  });

  if (!sendResult.success) {
    await prisma.signupOtp.deleteMany({ where: { email, consumedAt: null } });
    return { ok: false, error: "Could not send email. Try again later." };
  }

  if ("mocked" in sendResult && sendResult.mocked) {
    console.log(`[signup OTP] ${email}: ${code}`);
  }

  return { ok: true };
}

export async function completeSignupWithOtpAction(
  input: unknown,
): Promise<CompleteSignupResult> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fill in every field correctly." };
  }
  const { fullName, email, password, code, role } = parsed.data;

  const otp = await prisma.signupOtp.findFirst({
    where: {
      email,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return {
      ok: false,
      error: "No valid code for this email. Request a new code.",
    };
  }

  const match = await compare(code, otp.codeHash);
  if (!match) {
    return { ok: false, error: "Invalid verification code." };
  }

  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const passwordHash = await hash(password, 10);

  try {
    await prisma.$transaction([
      prisma.user.create({
        data: { fullName, email, role, passwordHash },
        select: { id: true },
      }),
      prisma.signupOtp.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      }),
    ]);
  } catch {
    return { ok: false, error: "Could not create account. Try again." };
  }

  return { ok: true };
}
