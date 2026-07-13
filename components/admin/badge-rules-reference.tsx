import { BookOpen } from "lucide-react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { BADGE_RULE_DEFINITIONS } from "@/lib/badges/rule-definitions";

export function BadgeRulesReference() {
  return (
    <AdminPanel
      title="Badge rules reference"
      description="Every rule type the badge engine supports today. Pick one when creating a badge — the engine awards it automatically."
      className="mb-6"
    >
      <ul className="grid gap-3 lg:grid-cols-2">
        {BADGE_RULE_DEFINITIONS.map((rule) => (
          <li
            key={rule.value}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                <BookOpen className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {rule.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {rule.description}
                </p>
                <div className="mt-2 grid gap-2 text-[11px] sm:grid-cols-2">
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-muted-foreground">
                      Rule type
                    </p>
                    <code className="mt-0.5 block rounded bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--foreground)]">
                      {rule.value}
                    </code>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-muted-foreground">
                      Example config
                    </p>
                    <code className="mt-0.5 block rounded bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--foreground)]">
                      {rule.example}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AdminPanel>
  );
}
