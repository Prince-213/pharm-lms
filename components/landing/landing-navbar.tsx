"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "@/lib/icons/client";
import { VerifyCertificateDialog } from "@/components/courses/verify-certificate-dialog";
import { LandingSearchForm } from "@/components/landing/landing-search-form";
import { getLandingContent, type LandingAudience } from "@/lib/landing-content";

const navLinks = [
  { label: "Become a Tutor", href: "/for-instructors" },
  { label: "Mentor on PharmLms", href: "/for-mentors" },
];

type LandingNavbarProps = {
  audience?: LandingAudience;
};

export function LandingNavbar({ audience = "student" }: LandingNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navbar } = getLandingContent(audience);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-[99%] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-10">
        <div className="flex w-[65%] items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center"
            >
              <img
                src="/assets/pharmlms-logo.png"
                alt="PharmLMS"
                className="h-7 w-auto"
              />
            </Link>

            <div className="flex items-center gap-4 px-4">
              <VerifyCertificateDialog
                triggerVariant="nav"
                className="hidden md:block"
              />

              <Link
                href="/courses"
                className="hidden text-sm text-slate-700 transition-colors hover:text-[var(--emerald)] md:block"
              >
                Find Courses
              </Link>
            </div>
          </div>

          <LandingSearchForm
            placeholder={navbar.searchPlaceholder}
            className="hidden w-full flex-1 items-center gap-2 rounded-full border border-slate-400 bg-slate-50 px-3 py-3 md:flex"
            inputClassName="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="flex w-[35%] items-center justify-end">
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-slate-600 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-[var(--emerald)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-8">
            <Link
              href={navbar.signInHref}
              className="hidden text-sm text-slate-700 transition-colors hover:text-[var(--emerald)] md:block"
            >
              Sign in
            </Link>
            <Link
              href={navbar.signUpHref}
              className="hidden items-center rounded-lg bg-[var(--emerald)] px-4 py-2 text-sm text-white shadow-lg transition hover:bg-[var(--primary)] active:scale-95 md:inline-flex"
            >
              {navbar.signUpLabel}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          <LandingSearchForm
            placeholder={navbar.searchPlaceholder}
            className="mb-3 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"
            inputClassName="flex-1 bg-transparent text-sm outline-none"
          />
          <div className="mb-2">
            <VerifyCertificateDialog
              triggerVariant="nav"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-[var(--emerald)]"
            />
          </div>
          <Link
            href="/courses"
            onClick={() => setMobileOpen(false)}
            className="mb-2 block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-[var(--emerald)]"
          >
            Find Courses
          </Link>
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-[var(--emerald)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href={navbar.signInHref}
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-sm text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                href={navbar.signUpHref}
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-[var(--emerald)] py-2 text-center text-sm text-white"
              >
                {navbar.signUpLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
