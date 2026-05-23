"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function initialsFromName(fullName: string): string {
  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

type UserAvatarProps = {
  src: string | null | undefined;
  name: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  src,
  name,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = typeof src === "string" ? src.trim() : "";
  const showImage = trimmed.length > 0 && !failed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[var(--primary-soft)]",
        className,
      )}
    >
      {showImage ? (
        // biome-ignore lint/performance/noImgElement: arbitrary OAuth/CDN/signed URLs
        <img
          src={trimmed}
          alt={name}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center font-semibold text-[var(--primary-strong)]",
            fallbackClassName,
          )}
          aria-hidden
        >
          {initialsFromName(name)}
        </span>
      )}
    </div>
  );
}
