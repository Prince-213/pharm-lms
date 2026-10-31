"use client";

import { toast } from "sonner";
import type { UserRole } from "@/generated/prisma/enums";
import {
  wrongPortalActionCopy,
  wrongPortalErrorMessage,
} from "@/lib/auth/wrong-portal";

export function showWrongPortalToasts(opts: {
  attemptedLabel: string | null;
  actualRole: UserRole | null;
}) {
  const errorMsg = wrongPortalErrorMessage(opts.attemptedLabel);
  toast.error(errorMsg);

  if (!opts.actualRole) return errorMsg;

  const action = wrongPortalActionCopy(opts.actualRole);
  window.setTimeout(() => {
    toast(action.message, {
      duration: 12_000,
      action: {
        label: action.actionLabel,
        onClick: () => {
          window.location.assign(action.href);
        },
      },
    });
  }, 350);

  return errorMsg;
}
