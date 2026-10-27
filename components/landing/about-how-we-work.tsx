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

const steps = [
  {
    index: "01",
    title: "Apply or enrol",
    body: "Learners start on the pathway. Tutors and mentors apply with a pharmacy background. Nothing is automatic.",
  },
  {
    index: "02",
    title: "Review",
    body: "Courses are checked before they list. Mentors are approved before a learner can book. The catalogue stays grounded.",
  },
  {
    index: "03",
    title: "Teach, sit, study",
    body: "Tutors publish. Mentors host sessions around a shift pattern. Learners work through levels on evenings and weekends.",
  },
  {
    index: "04",
    title: "A public credential",
    body: "Finish a course and the certificate has a page. Employers check it on PharmEdge — they do not have to take a screenshot on trust.",
  },
];

export function AboutHowWeWork() {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/assets/marketing/about-principles.jpg"
              alt="Practitioner focused on analysis work"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="space-y-10">
          <div className="space-y-4">
            <LandingEyebrow>How we work</LandingEyebrow>
            <LandingHeading>
              Review first. Then the work goes live.
            </LandingHeading>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
              PharmEdge is slower than an open marketplace on purpose. Quality
              for pharmacists beats a long list of unchecked courses.
            </p>
          </div>
          <AnimatedStagger className="flex flex-col">
            {steps.map((step) => (
              <AnimatedStaggerItem key={step.index}>
                <article className="grid grid-cols-[auto_1fr] gap-5 border-t border-border py-6 md:py-7">
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
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
