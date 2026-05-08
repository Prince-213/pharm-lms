"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import {
  BADGE_RULE_VALUES,
  findRuleDefinition,
} from "@/lib/badges/rule-definitions";
import { db } from "@/lib/db";

const createBadgeSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().min(4).max(280),
  ruleType: z.enum(BADGE_RULE_VALUES as unknown as [string, ...string[]]),
  threshold: z.number().int().min(1).max(10_000),
});

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;

export type CreateBadgeResult =
  | { ok: true; badgeId: string }
  | { ok: false; message: string };

export async function createBadgeAction(
  input: CreateBadgeInput,
): Promise<CreateBadgeResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = createBadgeSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Invalid input" };
  }

  const { name, description, ruleType, threshold } = parsed.data;
  const def = findRuleDefinition(ruleType);
  if (!def) {
    return { ok: false, message: "Unknown rule type." };
  }

  const ruleConfig = { [def.configKey]: threshold } as Record<string, number>;

  try {
    const badge = await db.badge.create({
      data: {
        name,
        description,
        ruleType,
        ruleConfig,
        createdById: session.user.id,
      },
      select: { id: true },
    });
    revalidatePath("/admin/badges");
    return { ok: true, badgeId: badge.id };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (code === "P2002") {
      return { ok: false, message: "A badge with this name already exists." };
    }
    console.error("createBadgeAction failed", error);
    return { ok: false, message: "Could not create badge." };
  }
}
