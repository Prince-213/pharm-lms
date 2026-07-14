"use client";

import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <Button
        type="button"
        size={open ? "icon" : "default"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed z-[85] bg-primary text-primary-foreground shadow-lg hover:bg-[var(--primary-strong)]",
          "bottom-36 right-4 md:bottom-32 lg:bottom-24 lg:right-6",
          !open && "gap-1.5 rounded-full px-3 sm:px-4",
        )}
        aria-label="Open course assistant"
      >
        {open ? (
          <X className="h-5 w-5 shrink-0" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span className="text-xs font-semibold lg:hidden">Help</span>
          </>
        )}
      </Button>

      {open ? (
        <Card
          className={cn(
            "fixed z-[85] w-[min(92vw,380px)] overflow-hidden border-[#d1d7dc] py-0 shadow-lg",
            "bottom-52 right-4 md:bottom-48 lg:bottom-40 lg:right-6",
          )}
        >
          <CardHeader className="border-b border-[#d1d7dc] bg-[#f7f9fa] px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-primary" />
              Course assistant
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Grounded in your enrolled course content
            </p>
          </CardHeader>

          <ScrollArea className="max-h-[52vh] px-3 py-3">
            <div className="space-y-2">
              {turns.map((t, i) => (
                <div
                  key={`${t.role}-${i}`}
                  className={
                    t.role === "user"
                      ? "ml-auto max-w-[88%] rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
                      : "max-w-[88%] rounded-lg border border-[#d1d7dc] bg-background px-3 py-2 text-xs"
                  }
                >
                  {t.content}
                </div>
              ))}
              {sending ? (
                <div className="inline-flex items-center gap-1 rounded-lg border border-[#d1d7dc] px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              ) : null}
            </div>
          </ScrollArea>

          <CardContent className="border-t border-[#d1d7dc] p-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                disabled={sending || disabled}
                placeholder={
                  disabled
                    ? "Complete lessons to unlock context chat"
                    : "Ask a question"
                }
                className="h-10"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => void send()}
                disabled={sending || disabled || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error ? (
              <Alert variant="destructive" className="mt-2 py-2">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
