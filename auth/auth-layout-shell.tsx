import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { FloatingPaths } from "@/components/auth/floating-paths";

type AuthLayoutShellProps = {
  children: React.ReactNode;
  quote: string;
  author: string;
  portalLabel?: string;
  sidebarFooter?: React.ReactNode;
};

export function AuthLayoutShell({
  children,
  quote,
  author,
  portalLabel,
  sidebarFooter,
}: AuthLayoutShellProps) {
  return (
    <main className="auth-saas relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col border-r border-[var(--border)] bg-[var(--surface-muted)] p-10 lg:flex">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[var(--background)]" />
        <Link href="/" className="relative z-10 inline-block">
          <Image
            src="/assets/pharmlms-logo.png"
            alt="PharmLMS"
            width={160}
            height={40}
            className="h-8 w-auto"
            style={{ height: "auto" }}
            priority
          />
        </Link>
        {portalLabel ? (
          <p className="relative z-10 mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            {portalLabel}
          </p>
        ) : null}

        <div className="relative z-10 mt-auto space-y-8">
          <blockquote className="space-y-3">
            <p className="font-display text-xl leading-relaxed text-[var(--ink-deep)]">
              &ldquo;{quote}&rdquo;
            </p>
            <footer className="text-sm font-semibold text-[var(--muted)]">
              ~ {author}
            </footer>
          </blockquote>
          {sidebarFooter}
        </div>

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center px-6 py-10 sm:px-8">
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-80 w-140 -translate-y-1/2 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(26,26,46,0.06)_0,rgba(107,114,128,0.02)_50%,rgba(26,26,46,0.01)_80%)]" />
          <div className="absolute top-0 right-0 h-80 w-60 translate-x-[5%] -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(26,26,46,0.04)_0,rgba(26,26,46,0.01)_80%,transparent_100%)]" />
        </div>

        <Link
          href="/"
          className="absolute top-7 left-5 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--muted-soft)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink-deep)]"
        >
          <ChevronLeft className="size-4" />
          Home
        </Link>

        <div className="mx-auto w-full max-w-sm space-y-5">
          <Link href="/" className="inline-block lg:hidden">
            <Image
              src="/assets/pharmlms-logo.png"
              alt="PharmLMS"
              width={140}
              height={36}
              className="h-7 w-auto"
              style={{ height: "auto" }}
              priority
            />
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
