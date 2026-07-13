import { HelpCircle } from "lucide-react";

export type StatTrioItem = {
  label: string;
  value: string;
  sub: string;
  hint?: string;
};

export function PerformanceStatTrio({
  items,
}: {
  items: readonly [StatTrioItem, StatTrioItem, StatTrioItem];
}) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              This month so far · {item.label}
            </span>
            {item.hint ? (
              <span title={item.hint} className="text-muted-foreground">
                <HelpCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
                <span className="sr-only">{item.hint}</span>
              </span>
            ) : null}
          </div>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
            {item.value}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
