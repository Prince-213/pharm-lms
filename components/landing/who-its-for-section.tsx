import Link from "next/link";
import { ArrowRight, BookOpen, Presentation, Users } from "@/lib/icons/server";
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

const roles = [
  {
    href: "/student/signup",
    cta: "Create a free account",
    title: "Learn",
    icon: BookOpen,
    featured: true,
    body: "Follow the pathway from your first spreadsheet to a capstone project. Study in the evenings, on a laptop or a phone, and keep your job.",
  },
  {
    href: "/tutor/login",
    cta: "Teach on PharmEdge",
    title: "Teach",
    icon: Presentation,
    featured: false,
    body: "Turn what you know into a course with the guided builder. Every course is reviewed before it goes live, and you earn from your enrollments.",
  },
  {
    href: "/mentor/login",
    cta: "Mentor on PharmEdge",
    title: "Mentor",
    icon: Users,
    featured: false,
    body: "Guide pharmacists through the move you already made. Set your availability and run 1:1 sessions on careers, exams and growth.",
  },
] as const;

export function WhoItsForSection() {
  return (
    <section className="bg-background py-16 md:py-20 xl:py-24">
      <LandingContainer className="flex flex-col gap-10 xl:gap-14">
        <AnimatedSection className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div className="max-w-xl space-y-3">
            <LandingEyebrow>Who it is for</LandingEyebrow>
            <LandingHeading>Pharmacists learn from pharmacists here.</LandingHeading>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:justify-self-end lg:text-lg">
            Pick how you want to take part. The same account works for all three.
          </p>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <AnimatedStaggerItem
                key={role.title}
                className={role.featured ? "lg:col-span-6" : "lg:col-span-3"}
              >
              <Card
                className={
                  role.featured
                    ? "h-full border-0 bg-primary py-7 text-primary-foreground shadow-none ring-0 transition-transform hover:-translate-y-1"
                    : "h-full border-border/80 bg-card py-7 shadow-none transition-transform hover:-translate-y-1"
                }
              >
                <CardContent className="flex h-full flex-col gap-5">
                  <span
                    className={
                      role.featured
                        ? "flex size-12 items-center justify-center rounded-xl bg-accent/15 text-accent"
                        : "flex size-12 items-center justify-center rounded-xl bg-primary text-accent"
                    }
                  >
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold tracking-tight">
                      {role.title}
                    </h3>
                    <p
                      className={
                        role.featured
                          ? "max-w-md text-[15px] leading-relaxed text-white/80"
                          : "text-[15px] leading-relaxed text-muted-foreground"
                      }
                    >
                      {role.body}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="link"
                    className={
                      role.featured
                        ? "mt-auto h-auto justify-start px-0 text-base font-semibold text-accent hover:text-white"
                        : "mt-auto h-auto justify-start px-0 text-base font-semibold text-primary"
                    }
                  >
                    <Link href={role.href}>
                      {role.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              </AnimatedStaggerItem>
            );
          })}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
