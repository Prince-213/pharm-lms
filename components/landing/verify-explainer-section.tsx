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

const steps = [
  {
    index: "01",
    title: "Enter the ID",
    body: "The number is on the certificate. Paste it exactly — spaces and hyphens included if they appear on the document.",
  },
  {
    index: "02",
    title: "We look it up",
    body: "PharmEdge checks whether that ID was issued on the platform. There is no screenshot to interpret and no PDF to forward.",
  },
  {
    index: "03",
    title: "See who it belongs to",
    body: "A valid result shows the holder, the course, the issue date, and the certificate number. If nothing matches, the page says so.",
  },
];

const facts = [
  {
    title: "Issued on PharmEdge",
    body: "Only credentials created after a learner finishes a reviewed course appear here. We do not verify other schools.",
  },
  {
    title: "For employers and learners",
    body: "Hiring managers check a number in seconds. Learners share a link instead of a file that can be edited.",
  },
  {
    title: "No login required",
    body: "Verification is public on purpose. If the certificate is real, anyone with the ID can confirm it.",
  },
];

export function VerifyExplainerSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-muted py-20 md:py-24 lg:py-28"
    >
      <LandingContainer className="flex flex-col gap-16">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <AnimatedSection className="space-y-4">
            <LandingEyebrow>How it works</LandingEyebrow>
            <LandingHeading>Three steps. A yes or a no.</LandingHeading>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
              PharmEdge certificates are public so a recruiter does not have to
              take a PDF on trust. The check is the same whether you are hiring
              or confirming your own credential.
            </p>
          </AnimatedSection>
          <AnimatedStagger className="flex flex-col">
            {steps.map((step) => (
              <AnimatedStaggerItem key={step.index}>
                <article className="grid grid-cols-[auto_1fr] gap-5 border-t border-border py-6 last:border-b md:py-7">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
                    {step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </article>
              </AnimatedStaggerItem>
            ))}
          </AnimatedStagger>
        </div>

        <AnimatedStagger className="grid gap-5 md:grid-cols-3 md:gap-6">
          {facts.map((item) => (
            <AnimatedStaggerItem key={item.title}>
              <article className="flex h-full flex-col gap-4 border border-border bg-card p-7 sm:p-8">
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
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
