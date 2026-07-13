"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { notifyPortalMutation } from "@/lib/client/notify-portal-mutation";

/** Refresh the current route and notify other dashboard tabs/shells. */
export function refreshPortalAfterMutation(router: AppRouterInstance) {
  router.refresh();
  notifyPortalMutation();
}
