import { cn } from "@/lib/utils";

/** Udemy-inspired surface tokens shared by catalog, preview, and manage UIs. */
export const UDEMY_BORDER = "#d1d7dc";
export const UDEMY_SURFACE_MUTED = "#f7f9fa";
export const UDEMY_SURFACE_HOVER = "#eceff1";

export const udemyBorderClass = "border-[#d1d7dc]";
export const udemySurfaceMutedClass = "bg-[#f7f9fa]";
export const udemySurfaceHoverClass = "bg-[#eceff1]";

export const udemyCardShadow =
  "shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.12)]";

export function cnUdemyCard(className?: string) {
  return cn(
    "rounded-xl border border-[#d1d7dc] bg-white",
    udemyCardShadow,
    className,
  );
}

export function cnUdemyInput(className?: string) {
  return cn(
    "border-[#d1d7dc] bg-white text-foreground placeholder:text-muted-foreground",
    "focus-visible:border-[#d1d7dc] focus-visible:ring-[#d1d7dc]/30",
    className,
  );
}

export function cnUdemySectionLabel(className?: string) {
  return cn("text-sm font-medium text-foreground", className);
}

export function cnUdemyPageWell(className?: string) {
  return cn("bg-[#f7f9fa]", className);
}
