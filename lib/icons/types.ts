import type { ComponentType } from "react";

export type AppIcon = ComponentType<{
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;
