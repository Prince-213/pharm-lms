"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendChatMessageAction } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";

export function ThreadComposer({
  threadId,
  recipientId,
  placeholder = "Write a message…",
  redirectBase,
}: {
  threadId?: string;
  recipientId?: string;
  placeholder?: string;
  /** After starting a thread, navigate to `${redirectBase}?thread=id` */
  redirectBase?: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendChatMessageAction({
        threadId,
        recipientId,
        body,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setBody("");
      if (redirectBase && result.threadId) {
        router.push(`${redirectBase}?thread=${result.threadId}`);
        router.refresh();
        return;
      }
      refreshPortalAfterMutation(router);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 border-t border-border bg-card p-3"
    >
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={2}
          maxLength={4000}
          className="min-h-[2.5rem] flex-1 resize-y"
        />
        <Button type="submit" disabled={pending || !body.trim()} className="shrink-0">
          <Send className="h-4 w-4" />
          {pending ? "Sending…" : "Send"}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
