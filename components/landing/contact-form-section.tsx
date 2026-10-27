"use client";

import { Check, Envelope, MapPin, Phone } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  LandingContainer,
  LandingEyebrow,
  landingDisplayTitleClass,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactFormAction } from "@/lib/marketing/marketing-forms";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-lg border-border bg-background px-4 text-sm shadow-none md:text-sm";

const services = [
  "Learn the pathway from your first spreadsheet to a capstone",
  "Publish reviewed courses for pharmacists across Africa",
  "Mentor learners one-to-one on a calendar you keep",
  "Verify certificates on a public page employers can check",
];

const offices = [
  {
    title: "Phone",
    lines: ["+234 803 968 0912", "Working hours, West Africa time"],
  },
  {
    title: "Where we work",
    lines: ["Across Africa", "Built for pharmacists on the continent"],
  },
];

export function ContactFormSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Please agree to the terms before sending.");
      return;
    }
    setPending(true);
    try {
      const result = await submitContactFormAction({
        fullName: formData.fullName,
        email: formData.email,
        phone: "",
        subject: "Website contact",
        message: formData.message,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.mocked
          ? "Message accepted (email is mocked in this environment)."
          : "Message sent. We'll get back to you soon.",
      );
      setFormData({ fullName: "", email: "", message: "" });
      setAccepted(false);
    } catch {
      toast.error("Could not send your message. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      id="contact-form"
      className="bg-background py-16 sm:py-20 lg:py-28"
    >
      <LandingContainer>
        <AnimatedSection className="mx-auto max-w-2xl space-y-4 text-center">
          <LandingEyebrow>Contact us</LandingEyebrow>
          <h1 className={cn(landingDisplayTitleClass, "text-foreground")}>
            Get in touch with us
          </h1>
          <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Fill out the form below or write to the PharmEdge team at your
            convenience. We read every message.
          </p>
        </AnimatedSection>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-12 sm:mt-16 lg:mt-20 lg:grid-cols-2 lg:gap-20">
          <AnimatedSection delay={0.06}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  minLength={2}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message"
                  rows={4}
                  required
                  minLength={10}
                  className="min-h-[108px] rounded-lg border-border bg-background px-4 py-3 text-sm shadow-none"
                />
              </div>

              <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Checkbox
                  id="contact-terms"
                  checked={accepted}
                  onCheckedChange={(value) => setAccepted(value === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="contact-terms"
                  className="text-sm leading-relaxed font-normal text-muted-foreground"
                >
                  I agree with{" "}
                  <Link
                    href="/legal/terms"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="h-12 w-full rounded-full bg-primary text-sm font-semibold tracking-wide text-primary-foreground hover:bg-primary-strong"
              >
                {pending ? "Sending…" : "Send your request"}
              </Button>
            </form>

            <div className="mt-10">
              <p className="text-sm font-semibold text-foreground">
                You can also contact us via
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="mailto:pharmanalyticsteam@gmail.com"
                  className="inline-flex min-w-0 items-center gap-3 rounded-full border border-border bg-card py-2 pr-5 pl-2 transition-colors hover:border-primary/30 hover:bg-primary-soft"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary">
                    <Envelope className="size-4" weight="bold" />
                  </span>
                  <span className="truncate text-sm font-medium">
                    pharmanalyticsteam@gmail.com
                  </span>
                </a>
                <a
                  href="tel:+2348039680912"
                  className="inline-flex items-center gap-3 rounded-full border border-border bg-card py-2 pr-5 pl-2 transition-colors hover:border-primary/30 hover:bg-primary-soft"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary">
                    <Phone className="size-4" weight="bold" />
                  </span>
                  <span className="text-sm font-medium">+234 803 968 0912</span>
                </a>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="space-y-10 lg:pt-1">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                With PharmEdge you can
              </h2>
              <ul className="mt-6 space-y-4">
                {services.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" weight="bold" />
                    </span>
                    <span className="text-[15px] leading-relaxed text-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {offices.map((office) => (
                <div key={office.title} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <MapPin className="size-4" weight="fill" />
                    </span>
                    <p className="font-display text-base font-semibold">
                      {office.title}
                    </p>
                  </div>
                  {office.lines.map((line) => (
                    <p
                      key={line}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </LandingContainer>
    </section>
  );
}
