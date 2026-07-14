import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
          <Card key={card.title} className="shadow-none">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">{card.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
