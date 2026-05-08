"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { gradeSubmissionAction } from "@/app/tutor/assignments/actions";
import { toast } from "sonner";

export function GradeSubmissionForm({
  submissionId,
  initialGrade,
  initialFeedback,
}: {
  submissionId: string;
  initialGrade?: number;
  initialFeedback: string;
}) {
  const router = useRouter();
  const [grade, setGrade] = useState<string>(
    initialGrade !== undefined ? String(initialGrade) : "",
  );
  const [feedback, setFeedback] = useState(initialFeedback);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(grade);
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      toast.error("Grade must be between 0 and 100.");
      return;
    }
    const toastId = toast.loading("Saving grade...");
    startTransition(async () => {
      const result = await gradeSubmissionAction({
        submissionId,
        grade: num,
        feedback: feedback.trim() || undefined,
      });
      if (!result.ok) {
        toast.error(result.message, { id: toastId });
        return;
      }
      toast.success("Grade saved!", { id: toastId });
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end"
    >
      <label className="text-xs font-semibold text-[#1c1d1f]">
        Grade (0–100)
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="mt-1 h-10 w-full rounded border border-[#d1d7dc] bg-white px-2 text-sm"
        />
      </label>
      <label className="text-xs font-semibold text-[#1c1d1f]">
        Feedback
        <textarea
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={2000}
          placeholder="Optional feedback for the student"
          className="mt-1 w-full resize-y rounded border border-[#d1d7dc] bg-white px-3 py-2 text-sm"
        />
      </label>
      <div className="flex flex-col items-stretch gap-1">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save grade"}
        </button>
      </div>
    </form>
  );
}
