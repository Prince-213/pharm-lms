import type { LucideIcon } from "lucide-react";

type HighlightCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type InstructorHighlightCardsProps = {
  cards: HighlightCard[];
};

export function InstructorHighlightCards({ cards }: InstructorHighlightCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/80 p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)] shadow-sm">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[var(--ink-deep)]">
              {card.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              {card.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
