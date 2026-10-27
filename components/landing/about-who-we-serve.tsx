import {
  GraduationCap,
  Handshake,
  Presentation,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
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

const audiences = [
  {
    icon: GraduationCap,
    title: "Learners",
    body: "Pharmacists and students who need a pathway they can finish beside a full-time job — evenings, weekends, laptop or phone.",
    href: "/student/signup",
    label: "Start learning",
  },
  {
    icon: Presentation,
    title: "Tutors",
    body: "Practitioners who can turn clinic experience into a course. The builder, the review, and the catalogue sit in one place.",
    href: "/teach",
    label: "Teach on PharmEdge",
  },
  {
    icon: Handshake,
    title: "Mentors",
    body: "Pharmacists who already made the move. One-to-one sessions for portfolio, CV, interviews, and exams — on a calendar you keep.",
    href: "/become-a-mentor",
    label: "Mentor on PharmEdge",
  },
];

export function AboutWhoWeServe() {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>Who it is for</LandingEyebrow>
          <LandingHeading>
            One platform for the people who learn, teach, and guide.
          </LandingHeading>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            PharmEdge is not a generic course marketplace. It is a pharmacy
            pathway with three doors — and the same review standard behind each
            of them.
          </p>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-5 md:grid-cols-3 md:gap-6">
          {audiences.map((item) => (
            <AnimatedStaggerItem key={item.title}>
              <article className="flex h-full flex-col gap-6 border border-border bg-card p-7 sm:p-8">
                <IconBadge icon={item.icon} />
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="mt-auto pt-2 text-sm font-semibold text-primary hover:underline"
                >
                  {item.label} →
                </Link>
              </article>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
