"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  acceptMeetingRequestAction,
  rejectMeetingRequestAction,
} from "@/app/tutor/communication/meetings/actions";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export function MeetingRequestActions({
  meetingRequestId,
  preferredTime,
  onSuccess,
}: {
  meetingRequestId: string;
  preferredTime: Date | null;
  onSuccess?: () => void;
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
      onSuccess?.();
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
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <ButtonGroup className="w-full">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => reject()}
        className="flex-1 text-destructive hover:text-destructive"
      >
        Reject
      </Button>
      <Button
        type="button"
        disabled={pending}
        onClick={() => accept()}
        className="flex-1"
      >
        Accept
      </Button>
    </ButtonGroup>
  );
}
