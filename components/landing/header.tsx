"use client";

import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PharmLogo } from "@/components/brand/pharm-logo";
import { MarketingThemeToggle } from "@/components/landing/marketing-theme-toggle";
import { MOTION_EASE } from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";
import { getHeaderAuthCtas } from "@/lib/audience-landing-content";
import { cn } from "@/lib/utils";

const audienceLinks = [
  { label: "Teach", href: "/teach" },
  { label: "Mentor", href: "/become-a-mentor" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Verify", href: "/validate" },
  { label: "Contact", href: "/contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const LandingHeader = () => {
  const pathname = usePathname();
  const { loginHref, loginLabel, signupHref, signupLabel } =
    getHeaderAuthCtas(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the drawer after navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full overflow-x-clip border-b border-white/12 bg-sidebar text-sidebar-foreground",
        scrolled && "border-white/20",
      )}
    >
      <div className="mx-auto flex h-14 min-w-0 max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 md:gap-4 md:px-10 lg:h-16 lg:px-16 xl:px-20">
        <Link
          href="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <PharmLogo
            inverted
            priority
            markClassName="h-8 w-8 sm:h-10 sm:w-10"
            wordmarkClassName="text-base text-white sm:text-lg"
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden min-w-0 items-center gap-6 font-medium tracking-tight lg:flex"
        >
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative shrink-0 py-1 text-[0.9375rem] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-accent after:transition-all after:duration-200",
                  active
                    ? "text-white after:w-full"
                    : "text-white/72 after:w-0 hover:text-white hover:after:w-full",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {audienceLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 text-[0.9375rem] transition-colors duration-200",
                  active ? "text-accent" : "text-white/70 hover:text-accent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span aria-hidden className="hidden h-5 w-px bg-white/20 lg:block" />
          <MarketingThemeToggle />
          <span className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="ghost"
              className="h-10 rounded-md px-4 text-sm text-white/80 hover:bg-white/10 hover:text-white xl:px-5 xl:text-[15px]"
            >
              <Link href={loginHref}>{loginLabel}</Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 xl:text-[15px]"
            >
              <Link href={signupHref}>{signupLabel}</Link>
            </Button>
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="size-5" weight="duotone" aria-hidden />
            ) : (
              <List className="size-5" weight="duotone" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            className="overflow-hidden border-t border-white/12 bg-sidebar lg:hidden"
          >
            <div className="px-4 pt-3 pb-6 sm:px-6">
              <nav aria-label="Primary" className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {audienceLinks.map((link) => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "text-accent"
                          : "text-white/70 hover:bg-white/8 hover:text-accent",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-4 flex gap-3">
                <Link
                  href={loginHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md border border-white/25 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
                >
                  {loginLabel}
                </Link>
                <Link
                  href={signupHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-md bg-accent py-3 text-center text-sm font-semibold text-accent-foreground hover:bg-accent/90"
                >
                  {signupLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;
