"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function PortalSwitchLink({
  href,
  label,
  avatar,
  variant = "default",
}: {
  href: string;
  label: string;
  avatar: string;
  variant?: "default" | "sidebar";
}) {
  const isSidebar = variant === "sidebar";

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        void signOut({ redirect: false }).then(() => {
          window.location.href = href;
        });
      }}
      className={cn(
        "group flex flex-col items-center gap-2",
        isSidebar && "gap-1.5",
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden rounded-full ring-2 ring-transparent transition group-hover:ring-[var(--accent)]/30",
            isSidebar ? "h-14 w-14" : "h-20 w-20 lg:h-24 lg:w-24",
          )}
        >
          <Image
            src={avatar}
            alt={label}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </div>
      <span
        className={cn(
          "font-semibold transition-colors",
          isSidebar
            ? "text-xs text-muted-foreground group-hover:text-[var(--ink-deep)]"
            : "text-sm text-white group-hover:text-white/80",
        )}
      >
        {isSidebar ? label : `Login as ${label}`}
      </span>
    </Link>
  );
}
