"use client";

import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export function LogoutButton({ 
  variant = "solid", 
  className 
}: { 
  variant?: "solid" | "onDark";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={cn(
        "rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold transition",
        variant === "onDark"
          ? "border border-[var(--header-fg)]/35 bg-transparent text-[var(--header-fg)] hover:bg-white/10"
          : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)]",
        className
      )}
    >
      Logout
    </button>
  );
}
