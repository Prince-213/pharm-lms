"use client";

import type * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProfileSettingsTabs({
  tabs,
  defaultTabId,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTabId?: string;
}) {
  const first = tabs[0]?.id ?? "";
  const [active, setActive] = useState(defaultTabId ?? first);

  if (tabs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-1"
      >
        {tabs.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`settings-tab-${t.id}`}
              aria-controls={`settings-panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm sm:normal-case sm:tracking-tight",
                selected
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[120px]">
        {tabs.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`settings-panel-${t.id}`}
            aria-labelledby={`settings-tab-${t.id}`}
            hidden={active !== t.id}
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
