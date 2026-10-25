"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import { LandingContainer, LandingHeading } from "@/components/landing/landing-container";
import { subscribeNewsletterAction } from "@/lib/marketing/marketing-forms";

export function PathwayFinalCtaSection() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const result = await subscribeNewsletterAction({ email });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.mocked
          ? "Subscribed (email is mocked in this environment)."
          : "You're subscribed. Check your inbox for a confirmation.",
      );
      setEmail("");
    } catch {
      toast.error("Could not subscribe right now.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden py-16 text-white md:py-20 xl:py-24"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
      }}
    >
      <svg
        aria-hidden
        viewBox="0 0 26 26"
        className="pointer-events-none absolute top-[18%] right-[7%] size-8 text-accent opacity-25"
        fill="none"
      >
        <path
          d="M13 2v22M2 13h22"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <LandingContainer className="relative grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <AnimatedSection className="space-y-5 lg:col-span-7">
          <LandingHeading className="text-[2rem] text-white sm:text-[2.4rem] xl:text-[3.1rem]">
            Your next role starts with <span className="text-accent">level one.</span>
          </LandingHeading>
          <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Create a free account, open your first course and see how a pharmacy
            problem becomes a data problem you can solve.
          </p>
          <Button
            asChild
            className="h-[52px] rounded-full bg-accent px-8 text-base font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 hover:bg-accent/90"
          >
            <Link href="/student/signup">Start learning free</Link>
          </Button>
        </AnimatedSection>

        <AnimatedSection
          delay={0.1}
          className="lg:col-span-5"
        >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/8 p-6 backdrop-blur-[2px]"
        >
          <h3 className="font-display text-xl font-bold">Get new courses first</h3>
          <p className="text-[15px] leading-relaxed text-white/75">
            One email when a course or pathway level launches. No spam.
          </p>
          <label htmlFor="landing-newsletter-email" className="mt-2 text-sm font-medium">
            Email address
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Input
              id="landing-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={pending}
              className="h-12 flex-1 rounded-xl border-0 bg-white text-foreground"
            />
            <Button
              type="submit"
              disabled={pending}
              className="h-12 rounded-xl bg-accent px-5 font-bold text-accent-foreground hover:bg-accent/90"
            >
              {pending ? "Subscribing…" : "Subscribe"}
            </Button>
          </div>
        </form>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
