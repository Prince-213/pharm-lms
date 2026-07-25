"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { PaperPlaneIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletterAction } from "@/lib/marketing/marketing-forms";

export function NewsletterSection() {
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
      id="newsletter"
      className="relative overflow-hidden bg-[#f0f0f0] pb-16 lg:pb-24"
    >
      <div className="relative mx-auto w-[90%] px-4 sm:px-6 lg:w-[70%] lg:px-10">
        <div className="relative flex flex-col border-b border-gray-400 pb-20 lg:flex-row lg:items-end lg:gap-8 xl:gap-12">
          <div className="relative mb-10 flex-1 lg:mb-0">
            <img
              src="/assets/hightlight-crown.svg"
              alt=""
              className="absolute -top-8 left-2 h-8 w-auto"
              aria-hidden="true"
            />
            <h2 className="text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[40px] lg:text-[52px]">
              <span className="relative inline-block">
                <span className="relative inline-block px-1">
                  <span className="relative z-[1]">Keep</span>
                  <Image
                    src="/assets/hightlight-crown.svg"
                    alt=""
                    width={92}
                    height={56}
                    className="pointer-events-none absolute -bottom-[8px] left-1/2 z-0 h-auto w-[118%] max-w-none -translate-x-1/2"
                    aria-hidden
                  />
                </span>
              </span>{" "}
              It Fresh With Us
            </h2>
            <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed text-[var(--muted-soft)]">
              Get the latest insights, tutorials, and course updates delivered
              straight to your inbox. Never miss out on what&apos;s new in
              online learning and skill development.
            </p>
          </div>

          <Image
            src="/assets/shape15.png"
            alt=""
            width={100}
            height={100}
            className="absolute right-[38%]"
            aria-hidden
          />

          <div className="w-full lg:shrink-0 xl:max-w-[40%]">
            <div className="rounded-b-[24px] bg-white p-8 lg:p-14">
              <h3 className="mb-3 font-display text-2xl font-bold text-[var(--ink-deep)]">
                Subscribe Our Newsletter
              </h3>
              <p className="mb-6 text-sm font-medium leading-relaxed text-gray-800">
                Subscribe now to receive exclusive learning tips, updates on new
                courses, and special offers.
              </p>

              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-r-full rounded-bl-full border-0 bg-[#1a1a2e] py-5 pl-6 pr-14 text-sm text-white placeholder:text-gray-400 focus-visible:ring-primary"
                    required
                    disabled={pending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 text-white hover:bg-white/10"
                    aria-label="Subscribe"
                    disabled={pending}
                  >
                    <PaperPlaneIcon className="h-6 w-6 rotate-45" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
