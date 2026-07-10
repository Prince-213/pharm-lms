"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MOTION_EASE } from "@/components/landing/motion-primitives";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Verify Certification", href: "/validate" },
];

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[var(--border)] bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:w-[90%]">
        {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center hover:scale-[1.02] transition-transform">
            <Image
              src="/assets/pharmlms-logo.png"
              alt="PharmLMS"
              width={160}
              height={40}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 font-semibold text-[var(--ink-deep)] lg:flex xl:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm transition-colors duration-300 hover:text-[var(--accent)] xl:text-[15px] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--accent)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <span className="hidden items-center gap-2 lg:flex">
          <Link href="/student/login">
            <Button
              variant="outline"
              className="px-4 text-sm bg-white text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] xl:px-5 xl:text-[15px]"
            >
              <span>Login</span>
              <ArrowRightIcon className="ml-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="px-4 text-sm bg-[var(--primary)] text-white border-[var(--primary)] hover:bg-[var(--primary-strong)] cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] xl:px-5 xl:text-[15px]"
            >
              <span>Contact Us</span>
              <ArrowRightIcon className="ml-1" />
            </Button>
          </Link>
        </span>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center justify-center rounded-lg p-2 text-[var(--ink-deep)] hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            className="overflow-hidden border-t border-[var(--border)] bg-white lg:hidden"
          >
            <div className="px-4 pb-6 pt-3">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ink-deep)] transition-colors hover:bg-accent-soft hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/student/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-[var(--accent)] py-3 text-center text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-[var(--primary)] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-strong)]"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;
