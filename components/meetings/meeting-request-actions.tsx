"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  acceptMeetingRequestAction,
  rejectMeetingRequestAction,
} from "@/app/tutor/communication/meetings/actions";

export function MeetingRequestActions({
  meetingRequestId,
  preferredTime,
}: {
  meetingRequestId: string;
  preferredTime: Date | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function accept() {
    const startsIso = preferredTime
      ? preferredTime.toISOString()
      : new Date().toISOString();
    const tid = toast.loading("Scheduling meeting…");
    startTransition(async () => {
      const r = await acceptMeetingRequestAction(meetingRequestId, startsIso);
      if (!r.ok) {
        toast.error(r.message, { id: tid });
        return;
      }
      toast.success("Meeting scheduled. The student was notified.", {
        id: tid,
      });
      router.refresh();
    });
  }

  function reject() {
    const tid = toast.loading("Declining…");
    startTransition(async () => {
      const r = await rejectMeetingRequestAction(meetingRequestId);
      if (!r.ok) {
        toast.error(r.message, { id: tid });
        return;
      }
      toast.success("Request declined. The student was notified.", { id: tid });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => reject()}
        className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
      >
        Reject
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => accept()}
        className="rounded bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)] disabled:opacity-60"
      >
        Accept
      </button>
    </div>
  );
}
