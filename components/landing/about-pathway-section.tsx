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

const levels = [
  {
    index: "01",
    short: "Excel",
    title: "Foundations of Data in Pharmacy",
    hours: "~15 hours",
  },
  {
    index: "02",
    short: "Power BI",
    title: "Data analysis and visualisation",
    hours: "~25 hours",
  },
  {
    index: "03",
    short: "SQL",
    title: "Digital health systems and SQL",
    hours: "~20 hours",
  },
  {
    index: "04",
    short: "R",
    title: "Statistical analysis with R",
    hours: "~15 hours",
  },
  {
    index: "05",
    short: "Python",
    title: "Python for analysis and ML",
    hours: "~30 hours",
  },
  {
    index: "06",
    short: "Capstone",
    title: "Portfolio, career and capstone",
    hours: "~20 hours",
  },
];

export function AboutPathwaySection() {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>The pathway · about 130 hours</LandingEyebrow>
          <LandingHeading>
            Six levels, from your first spreadsheet to a capstone.
          </LandingHeading>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            You learn one tool at a time. Every module opens with a pharmacy
            scenario, then teaches the tool that solves it.
          </p>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {levels.map((level) => (
            <AnimatedStaggerItem key={level.index} className="bg-card">
              <article className="flex h-full flex-col gap-5 bg-card p-6 sm:p-7">
                <span className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
                  {level.index}
                </span>
                <div className="mt-auto space-y-1">
                  <p className="font-display text-lg font-semibold">
                    {level.short}
                  </p>
                  <p className="text-sm leading-snug text-muted-foreground">
                    {level.title}
                  </p>
                  <p className="pt-2 font-mono text-[11px] tracking-[0.08em] text-muted-soft uppercase">
                    {level.hours}
                  </p>
                </div>
              </article>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
