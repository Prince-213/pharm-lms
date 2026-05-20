import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "mint"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[var(--primary)] text-white shadow hover:bg-[var(--primary-strong)]",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive: "border-transparent bg-red-500 text-slate-50 shadow hover:bg-red-500/80",
    outline: "text-slate-950 border border-slate-200",
    success: "border-transparent bg-emerald-100 text-emerald-800",
    mint: "border-transparent bg-[#b1f0ce]/20 text-[#0f5238] border border-[#b1f0ce]/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
