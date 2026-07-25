"use server";

import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@/generated/prisma/enums";
import { messageForExistingEmail } from "@/lib/auth/existing-account-message";
import { sendEmail } from "@/lib/notifications/email-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { randomInt } from "node:crypto";

const OTP_TTL_MS = 15 * 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;
const BCRYPT_ROUNDS = 10;

const emailSchema = z.string().email().toLowerCase();

const completeSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  role: z.enum([UserRole.STUDENT, UserRole.TUTOR, UserRole.MENTOR]),
});

export type OtpSendResult =
  | { ok: true; devEmailMocked?: boolean }
  | { ok: false; error: string; cooldownSeconds?: number };

export type CompleteSignupResult =
  | { ok: true }
  | { ok: false; error: string };

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const safeLocal = local.length <= 0 ? "*" : `${local[0] ?? "*"}***`;
  return `${safeLocal}@${domain}`;
}

function prismaErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: unknown }).code);
  }
  return undefined;
}

function generateSixDigitCode(): string {
  return String(randomInt(100000, 1000000));
}

const initiateSchema = z.object({
  fullName: z.string().min(2, "Enter your full name (at least 2 characters).").max(80),
  email: z.string().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
  confirmPassword: z.string(),
  role: z.enum([UserRole.STUDENT, UserRole.TUTOR, UserRole.MENTOR]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type InitiateSignupResult =
  | { ok: true; devEmailMocked?: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; cooldownSeconds?: number };

export async function initiateSignupAction(
  input: unknown,
): Promise<InitiateSignupResult> {
  const parsed = initiateSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const { email, fullName, password, role } = parsed.data;
  void fullName;
  void password;
  void role;

  return sendSignupOtpAction(email);
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
  const redacted = redactEmail(email);
  console.log(`[signup-otp] send_code start email=${redacted}`);

  const sendLimit = await checkRateLimit(`signup-otp-send:${email}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!sendLimit.allowed) {
    return {
      ok: false,
      error: "Too many verification emails. Try again later.",
    };
  }

  let step = "db_user_lookup";

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        accounts: { select: { provider: true } },
      },
    });
    if (existing) {
      console.log(
        `[signup-otp] send_code blocked: user_exists email=${redacted}`,
      );
      return {
        ok: false,
        error: messageForExistingEmail({
          passwordHash: existing.passwordHash,
          providers: existing.accounts.map((a) => a.provider),
        }),
      };
    }

    step = "db_otp_cooldown";
    const lastSend = await prisma.signupOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (lastSend) {
      const elapsed = Date.now() - lastSend.createdAt.getTime();
      if (elapsed < SEND_COOLDOWN_MS) {
        const cooldownSeconds = Math.ceil(
          (SEND_COOLDOWN_MS - elapsed) / 1000,
        );
        console.log(
          `[signup-otp] send_code blocked: cooldown email=${redacted} waitSeconds=${cooldownSeconds}`,
        );
        return {
          ok: false,
          error: `Please wait ${cooldownSeconds}s before requesting another code.`,
          cooldownSeconds,
        };
      }
    }

    step = "db_otp_delete";
    await prisma.signupOtp.deleteMany({
      where: { email, consumedAt: null },
    });

    const code = generateSixDigitCode();
    const codeHash = await hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    step = "db_otp_create";
    const otpRow = await prisma.signupOtp.create({
      data: { email, codeHash, expiresAt },
      select: { id: true },
    });
    console.log(
      `[signup-otp] send_code otp_row_created email=${redacted} otpId=${otpRow.id}`,
    );

    const html = `
    <p>Your PharmLMS verification code is:</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:0.2em;">${code}</p>
    <p>This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
  `;

    step = "email_send";
    const sendResult = await sendEmail({
      to: email,
      subject: "Your PharmLMS sign-up code",
      html,
    });

    if (!sendResult.success) {
      console.error(
        `[signup-otp] send_code blocked: email_not_sent email=${redacted}`,
      );
      await prisma.signupOtp.deleteMany({ where: { email, consumedAt: null } });
      return { ok: false, error: "Could not send email. Try again later." };
    }

    if ("mocked" in sendResult && sendResult.mocked) {
      console.log(
        `[signup-otp] send_code success mode=mock_console email=${redacted} code=${code}`,
      );
      return { ok: true, devEmailMocked: true };
    }

    console.log(
      `[signup-otp] send_code success mode=resend email=${redacted}`,
    );
    return { ok: true };
  } catch (err) {
    const code = prismaErrorCode(err);
    console.error(
      `[signup-otp] send_code failed step=${step} email=${redacted} prismaCode=${code ?? "n/a"}`,
      err,
    );
    return {
      ok: false,
      error:
        "Could not send verification code. Check the server log or try again.",
    };
  }
}

export async function completeSignupWithOtpAction(
  input: unknown,
): Promise<CompleteSignupResult> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fill in every field correctly." };
  }
  const { fullName, email, password, code, role } = parsed.data;

  const verifyLimit = await checkRateLimit(`signup-otp-verify:${email}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!verifyLimit.allowed) {
    return {
      ok: false,
      error: "Too many verification attempts. Request a new code later.",
    };
  }

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
    select: {
      id: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });
  if (exists) {
    return {
      ok: false,
      error: messageForExistingEmail({
        passwordHash: exists.passwordHash,
        providers: exists.accounts.map((a) => a.provider),
      }),
    };
  }

  const passwordHash = await hash(password, 10);

  try {
    await prisma.$transaction([
      prisma.user.create({
        data: { fullName, email, role, passwordHash, isActive: true },
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
