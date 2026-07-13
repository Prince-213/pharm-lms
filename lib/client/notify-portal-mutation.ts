"use client";

import { PORTAL_MUTATION_EVENT } from "@/components/system/portal-data-sync";

const PORTAL_MUTATION_CHANNEL = "pharm-portal-mutation";

/** Tell all mounted dashboard shells (and other tabs) to router.refresh() after a mutation. */
export function notifyPortalMutation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PORTAL_MUTATION_EVENT));
  try {
    const channel = new BroadcastChannel(PORTAL_MUTATION_CHANNEL);
    channel.postMessage({ type: "refresh" });
    channel.close();
  } catch {
    // BroadcastChannel unavailable in some embedded browsers.
  }
}
