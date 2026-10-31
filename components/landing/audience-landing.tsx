import Image from "next/image";
import Link from "next/link";
import { AudienceChecklistSection } from "@/components/landing/audience-checklist-section";
import { AudienceFaqSection } from "@/components/landing/audience-faq-section";
import { AudienceQuoteBand } from "@/components/landing/audience-quote-band";
import { AudienceRhythmSection } from "@/components/landing/audience-rhythm-section";
import { AudienceSplitFeatures } from "@/components/landing/audience-split-features";
import { AudienceStatsSection } from "@/components/landing/audience-stats-section";
import { AudienceTimelineSection } from "@/components/landing/audience-timeline-section";
import { AudienceWhoSection } from "@/components/landing/audience-who-section";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
  landingDisplayTitleClass,
} from "@/components/landing/landing-container";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";
import type { AudiencePageContent } from "@/lib/audience-landing-content";
import { cmsTutorImageSrc, getTutorsCms } from "@/lib/cms/tutors";

export function AudienceLanding({ content }: { content: AudiencePageContent }) {
  const { tutors } = getTutorsCms();
  const showTutors = content.peopleMode === "tutors" && tutors.length > 0;
  const faqTitle =
    content.slug === "teach"
      ? "Questions tutors ask before they publish."
      : "Questions mentors ask before they apply.";

  return (
    <main className="flex min-h-screen w-full flex-col">
      <section className="bg-background pt-16 md:pt-20 lg:pt-24">
        <LandingContainer className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <AnimatedSection className="max-w-xl space-y-5 pb-4 lg:pb-20">
            <LandingEyebrow>{content.breadcrumb}</LandingEyebrow>
            <h1 className={landingDisplayTitleClass}>
              {content.heroTitleLine1} {content.heroTitleLine2}{" "}
              <span className="text-primary">{content.heroHighlight}</span>
            </h1>
          </AnimatedSection>

          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-auto lg:min-h-[480px] xl:min-h-[560px]">
            <Image
              src={content.heroImage}
              alt={content.heroImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />
            <AnimatedSection
              delay={0.1}
              className="absolute bottom-0 left-0 z-10 w-[min(100%,20rem)] sm:w-[min(100%,22rem)]"
            >
              <blockquote className="border border-border bg-card p-5 sm:p-6">
                <p className="text-[15px] leading-relaxed text-foreground">
                  {content.quote}
                </p>
              </blockquote>
            </AnimatedSection>
          </div>
        </LandingContainer>
      </section>

      <section className="bg-background py-20 md:py-24 lg:py-28">
        <LandingContainer className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-24">
          <AnimatedSection>
            <LandingHeading>{content.causeHeadline}</LandingHeading>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.valueIntro}
            </p>
          </AnimatedSection>
        </LandingContainer>
      </section>

      <AudienceStatsSection eyebrow="At a glance" stats={content.stats} />

      <AudienceTimelineSection
        eyebrow={content.stepsEyebrow}
        title={content.stepsTitle}
        steps={content.steps}
      />

      <AudienceWhoSection
        eyebrow={content.whoEyebrow}
        title={content.whoTitle}
        lead={content.whoLead}
        items={content.who}
        image={content.whoImage}
        imageAlt={content.whoImageAlt}
      />

      <AudienceSplitFeatures
        eyebrow="What you get"
        title={
          content.slug === "teach"
            ? "Tools to publish, not a blank page."
            : "Sessions that fit a practising pharmacist."
        }
        image={content.valueImage}
        imageAlt={content.valueImageAlt}
        features={content.features}
      />

      <AudienceRhythmSection
        eyebrow={content.rhythmEyebrow}
        title={content.rhythmTitle}
        lead={content.rhythmLead}
        image={content.rhythmImage}
        imageAlt={content.rhythmImageAlt}
        items={content.rhythmItems}
      />

      <AudienceChecklistSection
        eyebrow="Included"
        title={content.checklistTitle}
        lead={content.checklistLead}
        items={content.checklist}
      />

      <AudienceQuoteBand
        quote={content.quoteBand}
        by={content.quoteBandBy}
        image={content.quoteBandImage}
        imageAlt={content.quoteBandImageAlt}
      />

      {showTutors ? (
        <section className="bg-background py-20 md:py-24 lg:py-28">
          <LandingContainer className="flex flex-col gap-12 lg:gap-16">
            <AnimatedSection className="max-w-2xl space-y-4">
              <LandingEyebrow>People</LandingEyebrow>
              <LandingHeading>
                Pharmacists already teaching on PharmEdge.
              </LandingHeading>
            </AnimatedSection>

            <AnimatedStagger className="grid grid-cols-2 gap-4 lg:max-w-xl">
              {tutors.map((person) => (
                <AnimatedStaggerItem key={person.id}>
                  <figure className="flex flex-col gap-3">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-primary-soft">
                      <Image
                        src={cmsTutorImageSrc(person.image)}
                        alt={person.name}
                        fill
                        sizes="200px"
                        className="object-cover"
                        style={
                          person.objectPosition
                            ? { objectPosition: person.objectPosition }
                            : undefined
                        }
                      />
                    </div>
                    <figcaption>
                      <p className="font-display text-base font-semibold">
                        {person.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {person.title ?? "Tutor"}
                      </p>
                    </figcaption>
                  </figure>
                </AnimatedStaggerItem>
              ))}
            </AnimatedStagger>
          </LandingContainer>
        </section>
      ) : null}

      {content.peopleMode === "mentor-photo" && content.peopleImage ? (
        <section className="bg-background py-20 md:py-24 lg:py-28">
          <LandingContainer>
            <AnimatedSection className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-20">
              <div className="relative aspect-[4/5] min-h-[220px] overflow-hidden rounded-md sm:aspect-[5/4] sm:min-h-[320px] lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={content.peopleImage}
                  alt={content.peopleImageAlt ?? content.heroImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="max-w-md border-l-2 border-accent py-1 pl-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                {content.mentorBandCaption}
              </p>
            </AnimatedSection>
          </LandingContainer>
        </section>
      ) : null}

      <AudienceFaqSection title={faqTitle} faqs={content.faqs} />

      <section className="grid lg:grid-cols-2">
        <div className="bg-primary py-20 text-primary-foreground md:py-24 lg:py-28">
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center gap-6 px-6 sm:px-10 lg:ml-auto lg:px-16">
            <AnimatedSection>
              <h2 className="font-display text-balance text-[1.55rem] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[1.85rem] md:text-[2.1rem]">
                {content.ctaHeadline}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/75">
                {content.ctaSubtext}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-11 rounded-md bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90"
                >
                  <Link href={content.signupHref}>{content.signupLabel}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-md border-white/30 bg-transparent px-6 font-medium text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href={content.loginHref}>{content.loginLabel}</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
        <div className="relative min-h-[220px] bg-accent sm:min-h-[280px] lg:min-h-full">
          <Image
            src={content.ctaImage}
            alt={content.ctaImageAlt}
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-accent/25" aria-hidden />
          <div
            className="absolute right-0 bottom-0 h-24 w-24 bg-accent sm:h-32 sm:w-32"
            aria-hidden
          />
        </div>
      </section>
    </main>
  );
}
