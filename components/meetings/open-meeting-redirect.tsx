"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Opens Jitsi in a new tab and sends this tab to `returnTo` (e.g. dashboard).
 * Falls back to manual links if the popup is blocked.
 */
export function OpenMeetingRedirect({
  url,
  returnTo,
}: {
  url: string;
  returnTo: string;
}) {
  const router = useRouter();
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      setPopupBlocked(true);
      return;
    }
    router.replace(returnTo);
  }, [url, returnTo, router]);

  if (popupBlocked) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <p className="font-semibold text-[var(--foreground)]">Popup blocked</p>
        <p className="text-sm text-[var(--muted)]">
          Allow popups for this site, or open the meeting manually below.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-foreground)]"
        >
          Open meeting
        </a>
        <div>
          <button
            type="button"
            onClick={() => router.replace(returnTo)}
            className="text-sm font-bold text-[var(--primary)] underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-16 text-center">
      <p className="font-semibold text-[var(--foreground)]">
        Opening your meeting…
      </p>
      <p className="text-sm text-[var(--muted)]">
        It should open in a new tab; this page will return to your dashboard.
      </p>
    </div>
  );
}
