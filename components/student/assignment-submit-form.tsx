"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitAssignmentAction } from "@/app/student/actions/assignments";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import {
  putFileToStorage,
  requestDirectUploadPresign,
} from "@/lib/upload/direct-storage-upload";

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Could not upload your file.";
}

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
      <p className="rounded border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-xs text-muted-foreground">
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
          const presign = await requestDirectUploadPresign(
            `/api/student/assignments/${assignmentId}/upload/presign`,
            {
              fileName: pendingFile.name,
              contentType: pendingFile.type || "application/octet-stream",
              contentLength: pendingFile.size,
            },
          );

          if (!presign) {
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
          } else {
            await putFileToStorage(
              presign.uploadUrl,
              pendingFile,
              presign.contentType ||
                pendingFile.type ||
                "application/octet-stream",
            );
            url = presign.url;
            setAttachmentUrl(presign.url);
            setPendingFile(null);
          }
        } catch (err) {
          setError(errorMessage(err));
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
      refreshPortalAfterMutation(router);
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
      <label className="block text-xs font-semibold text-muted-foreground">
        Attach file (optional)
        <input
          type="file"
          accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.xls,.xlsx"
          onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-xs text-[var(--foreground)] outline-none file:mr-2 file:rounded file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-2 file:py-1 file:text-sm file:font-medium file:text-[var(--foreground)]"
        />
      </label>
      {attachmentUrl ? (
        <p className="text-xs text-muted-foreground">
          Current file attached for grading (submit again to replace after
          uploading a new file).
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
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
