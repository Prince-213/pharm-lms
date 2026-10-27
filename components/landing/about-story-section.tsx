import Image from "next/image";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";

const principles = [
  {
    title: "Pharmacy first",
    body: "Every module opens with a pharmacy scenario, then teaches the tool that solves it. Spreadsheets and SQL are not the point — the decision is.",
  },
  {
    title: "Finishable hours",
    body: "About 130 guided hours across six levels. Built for evenings and weekends, not a sabbatical.",
  },
  {
    title: "Reviewed before live",
    body: "Courses are checked before the catalogue lists them. Mentors are approved before anyone can book.",
  },
  {
    title: "A credential you can show",
    body: "Every certificate has a public page. A recruiter can confirm it in seconds — no PDF to forward and hope.",
  },
];

export function AboutStorySection() {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection className="space-y-7">
          <LandingEyebrow>How PharmEdge is built</LandingEyebrow>
          <LandingHeading>
            Africa&apos;s digital health economy is growing. Pharmacists needed
            a door in.
          </LandingHeading>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground md:text-base">
            <p>
              PharmEdge is Africa&apos;s first pharmacy-specific digital health
              education platform, built by PharmAnalytics. Few programmes give
              pharmacists a structured way into data, pharmacovigilance, and
              informatics without leaving the job they already have.
            </p>
            <p>
              The pathway is the spine: Excel, Power BI, SQL, R, Python, then a
              capstone. Tutors publish the courses that sit on that spine.
              Mentors sit with learners who need a map for the move.
              Certificates are public so the work can be checked.
            </p>
            <p>
              We do not invent a catalogue to look busy. Learners only see
              courses that exist, have passed review, and belong on a pharmacy
              pathway.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="space-y-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-card">
            <Image
              src="/assets/marketing/about-how.jpg"
              alt="Team working through analysis together"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
            {principles.map((item) => (
              <li key={item.title} className="space-y-1.5">
                <h3 className="font-display text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
