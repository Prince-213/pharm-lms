"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendChatMessageAction } from "@/app/actions/chat";

export function ThreadComposer({
  threadId,
  recipientId,
  placeholder = "Write a message…",
}: {
  threadId?: string;
  recipientId?: string;
  placeholder?: string;
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
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 border-t border-[#e3e5e8] bg-white p-3"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={2}
        maxLength={4000}
        className="flex-1 resize-y rounded border border-[#d1d7dc] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
      />
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="inline-flex h-10 items-center gap-2 rounded bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {pending ? "Sending…" : "Send"}
      </button>
      {error ? <p className="ml-3 text-xs text-rose-600">{error}</p> : null}
    </form>
  );
}
