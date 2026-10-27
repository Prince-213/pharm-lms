import {
  Certificate,
  Chats,
  Handshake,
  Presentation,
} from "@phosphor-icons/react/ssr";
import { IconBadge } from "@/components/landing/icon-badge";
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

const topics = [
  {
    icon: Chats,
    title: "Courses and the pathway",
    body: "Enrolment, levels, study load, or which door to start through. Write if the catalogue does not answer it.",
  },
  {
    icon: Presentation,
    title: "Teaching on PharmEdge",
    body: "Tutor applications, the course builder, review, pricing, and payouts. The Teach page covers the playbook; we handle the rest.",
  },
  {
    icon: Handshake,
    title: "Mentorship",
    body: "Applying to mentor, session scheduling, or booking as a learner. Mentors are reviewed before anyone can sit with them.",
  },
  {
    icon: Certificate,
    title: "Certificates and partnerships",
    body: "Public verification, employer checks, and organisations that want a cohort on the pathway. Send the context — we read it.",
  },
];

export function ContactTopicsSection() {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>What to write about</LandingEyebrow>
          <LandingHeading>
            We read every message. These are the usual ones.
          </LandingHeading>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            PharmEdge is run by PharmAnalytics. There is no ticket maze — the
            same team that reviews courses reads contact mail.
          </p>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {topics.map((item) => (
            <AnimatedStaggerItem key={item.title}>
              <article className="flex h-full flex-col gap-5 bg-card p-7 sm:p-8">
                <IconBadge icon={item.icon} />
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {item.body}
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
