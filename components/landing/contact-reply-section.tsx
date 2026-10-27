import Image from "next/image";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";

const replies = [
  {
    title: "Email",
    body: "pharmanalyticsteam@gmail.com — the fastest way to reach the team with documents, certificate IDs, or a longer brief.",
  },
  {
    title: "Phone",
    body: "+234 803 968 0912 — for time-sensitive questions during working hours.",
  },
  {
    title: "Where we work",
    body: "Across Africa. PharmEdge is built for pharmacists on the continent, not a single campus office.",
  },
  {
    title: "How quickly we reply",
    body: "We aim to answer within two working days. Course review and mentor applications follow their own queue — we will say so if that is the case.",
  },
];

export function ContactReplySection() {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/assets/marketing/contact-team.jpg"
              alt="PharmEdge team in a working discussion"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="space-y-10">
          <div className="space-y-4">
            <LandingEyebrow>How we reply</LandingEyebrow>
            <LandingHeading>A small team. Direct answers.</LandingHeading>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
              Use the form for a written trail. Use email or phone if you
              already have a certificate ID, an application, or a partnership
              brief.
            </p>
          </div>
          <ul className="flex flex-col">
            {replies.map((item) => (
              <li
                key={item.title}
                className="border-t border-border py-6 last:border-b md:py-7"
              >
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
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
