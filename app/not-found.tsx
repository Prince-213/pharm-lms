import Image from "next/image";
import Link from "next/link";
import LandingHeader from "@/components/landing/header";
import {
  LandingContainer,
  LandingEyebrow,
} from "@/components/landing/landing-container";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div data-marketing className="overflow-x-clip">
      <LandingHeader />
      <main className="bg-background">
        <LandingContainer className="grid min-h-[70vh] items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="max-w-lg">
            <LandingEyebrow>404</LandingEyebrow>
            <h1 className="mt-3 font-display text-balance text-[2.4rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[3.2rem]">
              This page is not on the pathway.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              The address may be mistyped, or the page has moved. Head home, or
              open the course catalogue.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-md bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/">Back to home</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-md px-6">
                <Link href="/courses">Browse courses</Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-md px-6">
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-md bg-muted sm:min-h-[420px]">
            <Image
              src="/assets/marketing/error-404.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </LandingContainer>
      </main>
      <LandingFooter />
    </div>
  );
}
