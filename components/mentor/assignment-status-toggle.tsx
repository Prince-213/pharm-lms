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
    <div className="inline-flex items-center gap-1 rounded border border-[#d1d7dc] bg-white p-1 text-xs font-semibold">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => set(opt.value)}
          disabled={pending}
          className={
            opt.value === status
              ? "rounded bg-[var(--primary)] px-3 py-1.5 text-white shadow-sm"
              : "rounded px-3 py-1.5 text-[#3e4143] hover:bg-[#f7f7f8]"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
