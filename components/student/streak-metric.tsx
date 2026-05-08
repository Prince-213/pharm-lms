"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakMetricProps {
  days: number;
  active?: boolean;
  className?: string;
}

export function StreakMetric({
  days,
  active = true,
  className,
}: StreakMetricProps) {
  // Define visual tiers based on user thresholds
  const isTier1 = days >= 1 && days <= 3;
  const isTier2 = days >= 4 && days <= 10;
  const isTier3 = days >= 11;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-b-4 bg-orange-500 p-4 text-white transition-all hover:translate-y-0.5 hover:border-b-2 active:translate-y-1 active:border-b-0",
        !active &&
          "border-slate-400 bg-slate-300 transition-none hover:translate-y-0 hover:border-b-4",
        active && isTier1 && "border-orange-600 bg-orange-500",
        active && isTier2 && "border-orange-700 bg-linear-to-br from-orange-500 to-red-500 shadow-xl shadow-orange-200",
        active && isTier3 && "border-red-700 bg-linear-to-br from-orange-400 via-red-500 to-purple-600 shadow-2xl shadow-red-300",
        className,
      )}
    >
      {/* Icon Container with Scaling */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all duration-500 group-hover:scale-110",
          !active && "bg-black/10",
          active && isTier1 && "h-12 w-12",
          active && isTier2 && "h-14 w-14 ring-2 ring-white/30",
          active && isTier3 && "h-16 w-16 ring-4 ring-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)]",
        )}
      >
        <div className="relative">
          <Flame
            className={cn(
              "fill-current transition-all duration-500",
              !active && "h-7 w-7 text-slate-400",
              active && "animate-pulse",
              active && isTier1 && "h-8 w-8 text-white",
              active && isTier2 && "h-9 w-9 text-yellow-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
              active && isTier3 && "h-11 w-11 text-yellow-100 drop-shadow-[0_0_12px_rgba(255,255,255,1)]",
            )}
          />
          
          {/* Extra Glow for Tier 3 */}
          {active && isTier3 && (
            <>
              <Flame className="absolute inset-0 h-11 w-11 fill-current opacity-50 blur-md animate-ping" />
              <div className="absolute -inset-1 rounded-full bg-yellow-400/20 blur-xl animate-pulse" />
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-black transition-all",
              isTier1 ? "text-3xl" : isTier2 ? "text-4xl" : "text-5xl",
            )}
          >
            {days}
          </span>
          <span className="text-sm font-bold uppercase tracking-wider opacity-80">
            Day Streak
          </span>
        </div>
        <p className="max-w-[200px] text-xs font-medium leading-tight opacity-90">
          {!active
            ? "Log in tomorrow to keep the flame alive!"
            : isTier3
              ? "LEGENDARY! Your passion is truly unstoppable."
              : isTier2
                ? "You're on fire! Don't let up now."
                : "Keep the fire burning!"}
        </p>
      </div>

      {/* Decorative dots/circles for premium feel */}
      <div className={cn(
        "absolute -right-4 -top-4 rounded-full bg-white/10 blur-xl transition-all duration-700",
        isTier1 ? "h-16 w-16" : isTier2 ? "h-24 w-24" : "h-32 w-32"
      )} />
      
      <div className={cn(
        "absolute -bottom-8 left-1/4 rounded-full blur-2xl transition-all duration-700",
        isTier1 ? "h-20 w-20 bg-orange-400/30" : isTier2 ? "h-28 w-28 bg-red-400/40" : "h-40 w-40 bg-purple-400/50"
      )} />
    </div>
  );
}
