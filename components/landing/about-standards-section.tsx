import Image from "next/image";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import { cn } from "@/lib/utils";

const tiles = [
  {
    tone: "navy" as const,
    index: "01",
    title: "Flexible study",
    body: "Evenings, weekends, laptop or phone. Keep your job while you learn.",
    className: "md:col-start-1 md:row-start-1",
  },
  {
    tone: "navy" as const,
    index: "02",
    title: "Pharmacist instructors",
    body: "Taught by practitioners who already made the move into data and digital health.",
    className: "md:col-start-3 md:row-start-1",
  },
  {
    tone: "white" as const,
    index: "03",
    title: "Community",
    body: "Pharmacists across 7+ African countries studying the same pathway.",
    className: "md:col-start-1 md:row-start-2",
  },
  {
    tone: "white" as const,
    index: "04",
    title: "Reviewed before live",
    body: "Every course is checked before it reaches learners.",
    className: "md:col-start-3 md:row-start-2",
  },
  {
    tone: "navy" as const,
    index: "05",
    title: "Career pathways",
    body: "Data, pharmacovigilance, informatics — without leaving pharmacy.",
    className: "md:col-start-1 md:row-start-3",
  },
  {
    tone: "white" as const,
    index: "06",
    title: "Public certificates",
    body: "Every credential has a page a recruiter can check in seconds.",
    className: "md:col-span-2 md:col-start-2 md:row-start-3",
  },
];

export function AboutStandardsSection() {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>Our standards</LandingEyebrow>
          <LandingHeading>
            Committed to a pathway pharmacists can finish.
          </LandingHeading>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-5 md:grid-cols-3 md:grid-rows-[auto_auto_auto] md:gap-6">
          <AnimatedStaggerItem className="md:col-start-2 md:row-span-2 md:row-start-1">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-md bg-primary-soft">
              <Image
                src="/assets/marketing/teach-who.jpg"
                alt="Learners and tutors in a working session"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </AnimatedStaggerItem>
          {tiles.map((tile) => (
            <AnimatedStaggerItem key={tile.title} className={tile.className}>
              <StandardTile tile={tile} />
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}

function StandardTile({ tile }: { tile: (typeof tiles)[number] }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[200px] flex-col justify-between rounded-md p-7 sm:p-8",
        tile.tone === "navy"
          ? "bg-primary text-primary-foreground"
          : "border border-border/80 bg-card text-foreground",
      )}
    >
      <span className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
        {tile.index}
      </span>
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold">{tile.title}</h3>
        <p
          className={cn(
            "text-[15px] leading-relaxed",
            tile.tone === "navy" ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {tile.body}
        </p>
      </div>
    </div>
  );
}
