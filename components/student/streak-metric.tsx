"use client";

import { Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  return (
    <Card
      className={cn(
        "overflow-hidden border-primary/15 bg-primary/5",
        !active && "border-border bg-muted/40",
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10",
            !active && "bg-muted",
          )}
        >
          <Flame
            className={cn(
              "h-6 w-6",
              active ? "fill-primary text-primary" : "text-muted-foreground",
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <CardHeader className="gap-0 p-0">
            <CardDescription className="text-xs font-semibold uppercase tracking-wide">
              Learning streak
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2 font-display text-2xl font-black tabular-nums">
              {days}
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {days === 1 ? "day" : "days"}
              </span>
            </CardTitle>
          </CardHeader>
          <p className="mt-1 text-sm text-muted-foreground">
            {!active
              ? "Log in tomorrow to keep your streak going."
              : days >= 11
                ? "Outstanding consistency — keep it up."
                : days >= 4
                  ? "You're building a strong habit."
                  : "Complete a lesson today to grow your streak."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
