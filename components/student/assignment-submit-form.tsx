"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitAssignmentAction } from "@/app/student/actions/assignments";

export function AssignmentSubmitForm({
  assignmentId,
  initialContent,
  closed,
}: {
  assignmentId: string;
  initialContent: string;
  closed?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (closed) {
    return (
      <p className="rounded border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-xs text-[var(--muted)]">
        This assignment is closed for new submissions.
      </p>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await submitAssignmentAction({ assignmentId, content });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setFeedback("Submission saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={8000}
        placeholder="Write or paste your submission…"
        className="w-full resize-y rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-[var(--muted)]">
          {error ? <span className="text-rose-600">{error}</span> : null}
          {feedback ? (
            <span className="text-emerald-700">{feedback}</span>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending ? "Saving…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
