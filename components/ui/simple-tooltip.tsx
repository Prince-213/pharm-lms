"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SimpleTooltipProps = {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
};

/** Back-compat wrapper for legacy `content` / `side` tooltip usage. */
export function SimpleTooltip({
  content,
  side = "top",
  children,
}: SimpleTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  );
}
