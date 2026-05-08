"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(72),
  role: z.enum([UserRole.STUDENT, UserRole.TUTOR, UserRole.MENTOR]),
});

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function signupAction(input: unknown): Promise<SignupResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fill in every field correctly." };
  }
  const { fullName, email, password, role } = parsed.data;
  const exists = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) {
    return { ok: false, error: "An account with that email already exists." };
  }
  const passwordHash = await hash(password, 10);
  await prisma.user.create({
    data: { fullName, email, role, passwordHash },
    select: { id: true },
  });
  return { ok: true };
}
