"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/auth";
import {
  type JobCareerLevel,
  JobOnboardingStatus,
  type JobWorkStyle,
  UserRole,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { ROLE_OPTIONS } from "@/lib/jobs/constants";
import { sendWelcomeJobDigest } from "@/lib/jobs/ingest";
import { isStudentProfileComplete } from "@/lib/jobs/profile-complete";

const ROLE_IDS = new Set(ROLE_OPTIONS.map((r) => r.id));

function asWorkStyle(value: string): JobWorkStyle | null {
  if (value === "REMOTE" || value === "COUNTRY" || value === "RELOCATE") {
    return value;
  }
  return null;
}

function asLevel(value: string): JobCareerLevel | null {
  if (value === "STUDENT" || value === "EARLY" || value === "EXPERIENCED") {
    return value;
  }
  return null;
}

async function requireCompleteStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false as const, message: "Unauthorized." };
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, fullName: true, country: true, city: true },
  });
  if (!user || !isStudentProfileComplete(user)) {
    return { ok: false as const, message: "Complete your profile first." };
  }
  return { ok: true as const, userId: user.id };
}

export async function saveJobOnboardingAction(input: {
  roles: string[];
  workStyle: string;
  level: string;
  jobAlertsEnabled: boolean;
}) {
  const gate = await requireCompleteStudent();
  if (!gate.ok) return gate;

  const roles = input.roles.filter((id) =>
    ROLE_IDS.has(id as (typeof ROLE_OPTIONS)[number]["id"]),
  );
  const workStyle = asWorkStyle(input.workStyle);
  const level = asLevel(input.level);
  if (!roles.length || !workStyle || !level) {
    return {
      ok: false as const,
      message: "Choose roles, work style, and level.",
    };
  }

  await db.jobPreference.upsert({
    where: { userId: gate.userId },
    create: {
      userId: gate.userId,
      roles,
      workStyle,
      level,
      jobAlertsEnabled: input.jobAlertsEnabled,
      onboardingStatus: JobOnboardingStatus.COMPLETE,
    },
    update: {
      roles,
      workStyle,
      level,
      jobAlertsEnabled: input.jobAlertsEnabled,
      onboardingStatus: JobOnboardingStatus.COMPLETE,
    },
  });
  revalidatePath("/student/jobs");

  if (!input.jobAlertsEnabled) {
    return { ok: true as const, emailed: false };
  }
  after(() => {
    void sendWelcomeJobDigest(gate.userId);
  });
  return { ok: true as const, emailed: true };
}

export async function skipJobOnboardingAction() {
  const gate = await requireCompleteStudent();
  if (!gate.ok) return gate;

  await db.jobPreference.upsert({
    where: { userId: gate.userId },
    create: {
      userId: gate.userId,
      onboardingStatus: JobOnboardingStatus.SKIPPED,
      jobAlertsEnabled: true,
    },
    update: { onboardingStatus: JobOnboardingStatus.SKIPPED },
  });
  revalidatePath("/student/jobs");
  return { ok: true as const };
}

export async function disableJobAlertsAction() {
  const gate = await requireCompleteStudent();
  if (!gate.ok) return;
  await db.jobPreference.upsert({
    where: { userId: gate.userId },
    create: {
      userId: gate.userId,
      jobAlertsEnabled: false,
      onboardingStatus: JobOnboardingStatus.SKIPPED,
    },
    update: { jobAlertsEnabled: false },
  });
  revalidatePath("/student/jobs");
  revalidatePath("/student/jobs/unsubscribe");
}
