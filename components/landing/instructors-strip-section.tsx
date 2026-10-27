import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/lib/icons/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { cmsTutorImageSrc, getTutorsCms } from "@/lib/cms/tutors";

export function InstructorsStripSection() {
  const { tutors } = getTutorsCms();

  return (
    <section className="bg-background pb-20 md:pb-24 lg:pb-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <LandingEyebrow>Your instructors</LandingEyebrow>
            <LandingHeading>
              Taught by pharmacists who made the move.
            </LandingHeading>
          </div>
          <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold text-primary">
            <Link href="/courses">
              Meet all instructors
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-4 sm:grid-cols-2 lg:max-w-4xl">
          {tutors.map((tutor) => (
            <AnimatedStaggerItem key={tutor.id}>
            <Card
              className="border-border/80 py-0 shadow-none transition-transform hover:-translate-y-1"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-primary-soft">
                  <Image
                    src={cmsTutorImageSrc(tutor.image)}
                    alt={tutor.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    style={
                      tutor.objectPosition
                        ? { objectPosition: tutor.objectPosition }
                        : undefined
                    }
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-bold">{tutor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {tutor.title ?? "Pharmacy tutor"}
                  </p>
                </div>
              </CardContent>
            </Card>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
