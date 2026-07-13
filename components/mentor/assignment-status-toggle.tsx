"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateAssignmentStatusAction } from "@/app/tutor/assignments/actions";
import { AssignmentStatus } from "@/generated/prisma/enums";

export function AssignmentStatusToggle({
  id,
  status,
}: {
  id: string;
  status: AssignmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(next: AssignmentStatus) {
    if (next === status) return;
    startTransition(async () => {
      await updateAssignmentStatusAction({ assignmentId: id, status: next });
      router.refresh();
    });
  }

  const options: Array<{ value: AssignmentStatus; label: string }> = [
    { value: AssignmentStatus.DRAFT, label: "Draft" },
    { value: AssignmentStatus.SENT, label: "Open" },
    { value: AssignmentStatus.CLOSED, label: "Closed" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 text-xs font-semibold text-[var(--foreground)]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => set(opt.value)}
          disabled={pending}
          className={
            opt.value === status
              ? "rounded bg-[var(--primary)] px-3 py-1.5 text-[var(--primary-foreground)] shadow-sm"
              : "rounded px-3 py-1.5 text-muted-foreground hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
