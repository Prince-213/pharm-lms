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
    <div
      className={clsx(
        // Clinical flat card: hairline border, zero shadow at rest
        "group relative overflow-hidden rounded-xl border border-slate-200/60 bg-[var(--surface)] p-5 transition-all duration-200",
        // Clickable: left accent stripe slides in + slight shadow on hover
        href && "hover:border-[var(--primary)]/25 hover:shadow-sm",
      )}
    >
      {/* Left accent line — slides in on hover for clickable cards */}
      {href && (
        <span className="absolute left-0 top-4 h-8 w-0.5 origin-center scale-y-0 rounded-r-full bg-[var(--primary)] transition-transform duration-200 group-hover:scale-y-100" />
      )}

      {Icon ? (
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: accentBg ?? "var(--surface-muted)" }}
        >
          <Icon className="h-5 w-5 text-[var(--primary)]" strokeWidth={1.75} />
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <h3 className="font-display text-2xl font-black tabular-nums tracking-tight text-[var(--foreground)]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-[11px] italic text-slate-400">{hint}</p>
          ) : null}
        </div>

        {trend ? (
          <div
            className={clsx(
              "shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold",
              isDecreasing
                ? "bg-red-50 text-[var(--live)]"
                : "bg-emerald-50 text-[var(--success)]",
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
    <Link href={href} className="block transition-transform active:scale-95">
      {card}
    </Link>
  ) : (
    card
  );
}
