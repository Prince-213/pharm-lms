import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";

const roles = [
  {
    title: "Clinical Data Analyst",
    body: "Turn dispensing and clinical records into decisions.",
  },
  {
    title: "Pharmacovigilance Analyst",
    body: "Detect safety signals in adverse reaction reports.",
  },
  {
    title: "Health Informatics Specialist",
    body: "Connect pharmacy systems with FHIR and HL7 standards.",
  },
  {
    title: "Digital Health Strategist",
    body: "Guide how health organisations adopt data and AI tools.",
  },
];

export function CareersLeadSection() {
  return (
    <section className="bg-primary py-20 text-primary-foreground md:py-24 lg:py-28">
      <LandingContainer className="grid items-start gap-12 lg:grid-cols-12 lg:gap-20">
        <AnimatedSection className="space-y-5 lg:col-span-5">
          <LandingEyebrow className="text-accent">Where it leads</LandingEyebrow>
          <LandingHeading className="text-white">
            Keep your clinical edge. Add the data skills employers ask for.
          </LandingHeading>
          <p className="text-base leading-relaxed text-white/80 md:text-lg">
            You do not have to leave pharmacy. The roles below sit in pharmacy,
            industry, regulators and health technology.
          </p>
          <p className="text-[15px] leading-relaxed text-white/70">
            Mentors help you build your portfolio, CV and LinkedIn profile and
            prepare for interviews. We work with recruiters in our network. We
            open doors and support you through the move, but we do not guarantee
            a job.
          </p>
        </AnimatedSection>

        <AnimatedStagger
          stagger={0.08}
          className="divide-y divide-white/15 border-t border-white/15 lg:col-span-7"
        >
          {roles.map((role, index) => (
            <AnimatedStaggerItem
              key={role.title}
              direction="right"
              className="grid grid-cols-[auto_1fr] gap-5 py-7 sm:gap-8 md:py-8"
            >
              <span className="font-mono text-sm tracking-[0.12em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-display text-xl font-bold">{role.title}</h3>
                <p className="text-[15px] leading-relaxed text-white/75">
                  {role.body}
                </p>
              </div>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
