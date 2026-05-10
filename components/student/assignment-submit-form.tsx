"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitAssignmentAction } from "@/app/student/actions/assignments";

export function AssignmentSubmitForm({
  assignmentId,
  initialContent,
  initialAttachmentUrl,
  closed,
}: {
  assignmentId: string;
  initialContent: string;
  initialAttachmentUrl?: string | null;
  closed?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState(
    initialAttachmentUrl?.trim() ?? "",
  );
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
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
    const text = content.trim();
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      let url = attachmentUrl.trim();

      if (pendingFile) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.set("file", pendingFile);
          const up = await fetch(
            `/api/student/assignments/${assignmentId}/upload`,
            { method: "POST", body: fd },
          );
          if (!up.ok) {
            const j = (await up.json().catch(() => null)) as {
              error?: string;
            } | null;
            setError(
              typeof j?.error === "string"
                ? j.error
                : "Could not upload your file.",
            );
            setUploading(false);
            return;
          }
          const data = (await up.json()) as { url: string };
          url = data.url;
          setAttachmentUrl(data.url);
          setPendingFile(null);
        } catch {
          setError("Could not upload your file.");
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      if (!text && !url) {
        setError("Write a response or attach a file.");
        return;
      }

      const result = await submitAssignmentAction({
        assignmentId,
        content: text || undefined,
        attachmentUrl: url || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setFeedback("Submission saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={8000}
        placeholder="Write or paste your submission…"
        className="w-full resize-y rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
      />
      <label className="block text-xs font-semibold text-[var(--muted)]">
        Attach file (optional)
        <input
          type="file"
          accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.xls,.xlsx"
          onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-xs text-[var(--foreground)] outline-none file:mr-2 file:rounded file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-2 file:py-1 file:text-sm file:font-medium file:text-[var(--foreground)]"
        />
      </label>
      {attachmentUrl ? (
        <p className="text-xs text-[var(--muted)]">
          Current file attached for grading (submit again to replace after
          uploading a new file).
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-[var(--muted)]">
          {error ? <span className="text-rose-600">{error}</span> : null}
          {feedback ? (
            <span className="text-[var(--primary)]">{feedback}</span>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={
            pending ||
            uploading ||
            (!content.trim() && !pendingFile && !attachmentUrl.trim())
          }
          className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending || uploading ? "Saving…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
