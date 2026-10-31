import Image from "next/image";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { cmsTutorImageSrc, getTutorsCms } from "@/lib/cms/tutors";
import { ArrowRight } from "@/lib/icons/server";

export function LeadingProfessionalsSection() {
  const { tutors } = getTutorsCms();

  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <LandingEyebrow>Instructors</LandingEyebrow>
            <LandingHeading>
              Taught by people who already made the move.
            </LandingHeading>
          </div>
          <Button
            asChild
            variant="link"
            className="h-auto justify-start px-0 text-base font-semibold text-primary"
          >
            <Link href="/courses">
              Meet all instructors
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-4 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-2">
          {tutors.map((person) => (
            <AnimatedStaggerItem key={person.id}>
              <figure className="group relative aspect-[3/4] overflow-hidden rounded-md bg-primary-soft">
                <Image
                  src={cmsTutorImageSrc(person.image)}
                  alt={person.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover"
                  style={
                    person.objectPosition
                      ? { objectPosition: person.objectPosition }
                      : undefined
                  }
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-primary px-5 py-4 text-primary-foreground">
                  <p className="font-display text-lg font-bold">
                    {person.name}
                  </p>
                  <p className="text-sm text-white/75">
                    {person.title ?? "Tutor"}
                  </p>
                </figcaption>
              </figure>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
