import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

type BadgeIcon = ComponentType<{
  className?: string;
  weight?: "duotone";
}>;

/** Light navy tile with a navy glyph, so the icon and badge are the same hue. */
export function IconBadge({
  icon: Icon,
  className,
  iconClassName,
}: {
  icon: BadgeIcon;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary",
        className,
      )}
    >
      <Icon
        className={cn("size-5", iconClassName)}
        weight="duotone"
        aria-hidden
      />
    </span>
  );
}
