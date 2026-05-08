import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  href?: string;
  accentBg?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  href,
  accentBg,
}: AdminStatCardProps) {
  const isDecreasing = trend && trend.value < 0;

  const card = (
    <div className="group rounded-xl border-none bg-[var(--surface)] p-6 shadow-[var(--shadow-1)] transition hover:shadow-[var(--shadow-2)] dark:bg-gray-dark dark:shadow-card">
      {Icon ? (
        <div
          className="mb-6 flex h-11.5 w-11.5 items-center justify-center rounded-full"
          style={{ backgroundColor: accentBg ?? "var(--surface-muted)" }}
        >
          <Icon
            className="h-6 w-6 text-[var(--primary)]"
            strokeWidth={1.5}
          />
        </div>
      ) : null}

      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h4>
          <p className="mt-1 text-sm font-medium text-[var(--muted-soft)]">
            {label}
          </p>
          {hint ? (
             <p className="mt-1 text-[11px] text-[var(--muted)]/60 italic">{hint}</p>
          ) : null}
        </div>

        {trend ? (
          <div
            className={clsx(
              "flex items-center gap-1 text-sm font-medium",
              isDecreasing ? "text-[var(--live)]" : "text-[var(--success)]"
            )}
          >
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-[10px]">{isDecreasing ? "▼" : "▲"}</span>
          </div>
        ) : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
