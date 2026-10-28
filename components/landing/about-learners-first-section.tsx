import {
  Briefcase,
  Certificate,
  Clock,
  GraduationCap,
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

const items = [
  {
    icon: Clock,
    title: "Study while working",
    body: "The pathway is built for evenings and weekends, on a laptop or a phone.",
  },
  {
    icon: GraduationCap,
    title: "Instructors from practice",
    body: "You learn from people who already made the move into data and digital health.",
  },
  {
    icon: Certificate,
    title: "A public certificate",
    body: "Share a credential a recruiter can confirm on a public verification page.",
  },
  {
    icon: Briefcase,
    title: "Mentors for the move",
    body: "Portfolio, CV, LinkedIn and interviews — support through the next role.",
  },
];

export function AboutLearnersFirstSection() {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>Learners first</LandingEyebrow>
          <LandingHeading>
            Built around the job you already have.
          </LandingHeading>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
          {items.map((item) => (
            <AnimatedStaggerItem key={item.title}>
              <article className="flex h-full flex-col gap-6 border border-border bg-card p-7 sm:p-8">
                <IconBadge icon={item.icon} />
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold">
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
