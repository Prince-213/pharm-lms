"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Menu, X, GraduationCap } from "lucide-react";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About us", href: "#" },
    { label: "Courses", href: "/student/browse" },
    { label: "Contact us", href: "#" },
 
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-[90%] lg:w-[80%] justify-between items-center gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 w-[55%]">
          {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-bold tracking-tight text-[var(--primary)]"
        >
          <GraduationCap className="h-7 w-7 text-[var(--emerald)]" strokeWidth={1.75} />
          <span className="hidden sm:inline">PharmLMS</span>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 w-full md:flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 gap-2 ml-4">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Want to learn?"
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
          <button className="flex items-center gap-1 text-sm font-semibold text-[var(--emerald)] whitespace-nowrap hover:text-[var(--primary)] transition-colors">
            Explore <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        </div>

        <div className="flex items-center gap-4 w-[40%] space-x-8 justify-end">
          {/* Nav */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center text-sm font-medium text-slate-600">
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="hover:text-[var(--emerald)] transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link
            href="/student/login"
            className="hidden md:block text-sm font-semibold text-slate-700 hover:text-[var(--emerald)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/student/signup"
            className="hidden shadow-lg md:inline-flex items-center rounded-lg bg-[var(--emerald)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary)] active:scale-95"
          >
            Create free account
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex lg:hidden items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 gap-2 mb-3">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Want to learn?"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
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
                href="/student/login"
                className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                href="/student/signup"
                className="flex-1 rounded-lg bg-[var(--emerald)] py-2 text-center text-sm font-semibold text-white"
              >
                Create account
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
