"use client";

import { Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type BadgeEarnedToastProps = {
  toastId: string | number;
  badge: { id: string; name: string; iconUrl: string | null };
};

export function BadgeEarnedToast({ toastId, badge }: BadgeEarnedToastProps) {
  const router = useRouter();

  function handleClick() {
    toast.dismiss(toastId);
    router.push("/student/achievements");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-[340px] cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-3.5 text-left shadow-[var(--shadow-lg)] transition-opacity hover:opacity-90 active:scale-[0.99]"
      style={{
        backgroundColor: "var(--header)",
        borderColor: "rgba(16,185,129,0.25)",
      }}
    >
      {/* Icon */}
      <span
        className="mt-0.5 shrink-0 rounded-md p-1.5"
        style={{ backgroundColor: "rgba(16,185,129,0.15)" }}
      >
        {badge.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.iconUrl}
            alt=""
            className="h-5 w-5 object-contain"
          />
        ) : (
          <Award
            className="h-5 w-5"
            style={{ color: "var(--emerald)" }}
            strokeWidth={2}
          />
        )}
      </span>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--emerald)" }}
        >
          Badge Earned!
        </p>
        <p
          className="mt-0.5 truncate text-sm font-bold"
          style={{ color: "var(--header-fg)" }}
        >
          {badge.name}
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--header-fg-muted)" }}
        >
          Tap to view all your achievements →
        </p>
      </div>
    </button>
  );
}
