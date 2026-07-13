"use client";

import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Turn = { role: "user" | "assistant"; content: string };

export function CourseChatBubble({
  courseId,
  disabled,
}: {
  courseId: string;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content: disabled
        ? "This course has no lesson content for the assistant yet."
        : "Hi! I can help you study using the full enrolled course content. Ask about concepts, workflows, or exam-style questions.",
    },
  ]);

  async function send() {
    const message = input.trim();
    if (!message || sending || disabled) return;
    setInput("");
    setError(null);
    const nextTurns = [...turns, { role: "user", content: message } as Turn];
    setTurns(nextTurns);
    setSending(true);

    try {
      const res = await fetch("/api/ai/course-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          message,
          history: nextTurns.slice(-8),
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        reply?: string;
      } | null;
      if (!res.ok) {
        setError(body?.error ?? "Assistant is unavailable right now.");
        return;
      }
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: body?.reply ?? "I could not generate a reply just now.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-[85] inline-flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-lg)] transition hover:bg-[var(--primary-strong)]",
          "bottom-32 right-4 md:bottom-28 lg:bottom-5 lg:right-5",
          open
            ? "h-12 w-12 rounded-full"
            : "gap-1.5 rounded-full px-3 py-2.5 sm:px-4",
        )}
        aria-label="Open course assistant"
      >
        {open ? (
          <X className="h-5 w-5 shrink-0" />
        ) : (
          <MessageCircle className="h-5 w-5 shrink-0" />
        )}
        {!open ? (
          <span className="text-xs font-semibold lg:hidden">Help</span>
        ) : null}
      </button>

      {open ? (
        <div
          className={cn(
            "fixed z-[85] w-[min(92vw,380px)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]",
            "bottom-44 right-4 md:bottom-40 lg:bottom-20 lg:right-5",
          )}
        >
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <Bot className="h-4 w-4 text-[var(--primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Course assistant
              </p>
              <p className="text-[11px] text-muted-foreground">
                Grounded in your enrolled course content
              </p>
            </div>
          </div>

          <div className="max-h-[52vh] space-y-2 overflow-auto px-3 py-3">
            {turns.map((t, i) => (
              <div
                key={`${t.role}-${i}`}
                className={
                  t.role === "user"
                    ? "ml-auto max-w-[88%] rounded-lg bg-[var(--primary)] px-3 py-2 text-xs text-[var(--primary-foreground)]"
                    : "max-w-[88%] rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)]"
                }
              >
                {t.content}
              </div>
            ))}
            {sending ? (
              <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                disabled={sending || disabled}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                placeholder={
                  disabled
                    ? "Complete lessons to unlock context chat"
                    : "Ask a question"
                }
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || disabled || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-60"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
