import type { AppIcon } from "@/lib/icons";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: AppIcon;
  trend?: { value: number; label: string };
  href?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  href,
}: AdminStatCardProps) {
  const isDecreasing = trend && trend.value < 0;

  const card = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        href && "hover:border-primary/25 hover:shadow-sm",
      )}
    >
      {href ? (
        <span className="absolute left-0 top-4 h-8 w-0.5 origin-center scale-y-0 rounded-r-full bg-primary transition-transform duration-200 group-hover:scale-y-100" />
      ) : null}
      <CardHeader className="pb-2">
        {Icon ? (
          <div
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
          >
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
        ) : null}
        <CardDescription className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </CardDescription>
        <CardTitle className="font-display text-2xl font-black tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </CardTitle>
        {hint ? (
          <CardDescription className="text-[11px] italic">{hint}</CardDescription>
        ) : null}
      </CardHeader>
      {trend ? (
        <CardContent className="pt-0">
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold",
              isDecreasing
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
            )}
          >
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-[10px]">{isDecreasing ? "▼" : "▲"}</span>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );

  return href ? (
    <Link href={href} className="group block transition-transform active:scale-95">
      {card}
    </Link>
  ) : (
    card
  );
}
