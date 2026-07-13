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
      className="group flex w-[340px] cursor-pointer items-start gap-3 rounded-lg border border-primary/25 bg-sidebar p-3.5 text-left shadow-lg transition-opacity hover:opacity-90 active:scale-[0.99]"
    >
      <span className="mt-0.5 shrink-0 rounded-md bg-primary/15 p-1.5">
        {badge.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.iconUrl}
            alt=""
            className="h-5 w-5 object-contain"
          />
        ) : (
          <Award className="h-5 w-5 text-primary" strokeWidth={2} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Badge Earned!
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-sidebar-foreground">
          {badge.name}
        </p>
        <p className="mt-1 text-xs text-sidebar-foreground/70">
          Tap to view all your achievements →
        </p>
      </div>
    </button>
  );
}
