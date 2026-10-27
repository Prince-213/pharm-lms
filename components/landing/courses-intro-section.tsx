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

const notes = [
  {
    title: "Reviewed before it lists",
    body: "The catalogue only shows published courses that have passed platform review. Empty results mean nothing is live yet — not filler cards.",
  },
  {
    title: "Pharmacy scenarios first",
    body: "Modules open with the work pharmacists already do, then teach the tool that solves it. Data and digital health sit on that spine.",
  },
  {
    title: "A credential you can check",
    body: "Finish a course and the certificate has a public page. Employers verify it on PharmEdge instead of trusting a file.",
  },
];

export function CoursesIntroSection() {
  return (
    <section className="bg-background pt-16 pb-6 md:pt-20 lg:pt-24">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>Catalogue</LandingEyebrow>
          <LandingHeading>
            Courses that exist, and have been checked.
          </LandingHeading>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            PharmEdge does not pad this page with placeholders. Filter what is
            live, or browse the pathway if you are choosing where to start.
          </p>
        </AnimatedSection>
        <AnimatedStagger className="grid gap-8 md:grid-cols-3 md:gap-10">
          {notes.map((item) => (
            <AnimatedStaggerItem key={item.title}>
              <article className="h-full border-t border-border pt-6">
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
