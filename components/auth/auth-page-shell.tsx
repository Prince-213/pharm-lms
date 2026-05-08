import Link from "next/link";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-saas flex min-h-screen flex-col bg-[var(--auth-bg)] text-[var(--auth-text)]">
      <header className="shrink-0 px-4 py-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-[var(--auth-text)]"
          >
            Pharm<span className="text-[var(--auth-accent)]">LMS</span>
          </Link>
          <p className="text-xs leading-relaxed text-[var(--auth-muted)] sm:text-[13px]">
            Secure sign-in for your learning workspace.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-12">
        <div className="mx-auto w-full max-w-[400px] flex-1">{children}</div>
      </main>

      <footer className="shrink-0 border-t border-[var(--auth-border)] px-4 py-6">
        <div className="mx-auto flex w-full max-w-[400px] flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-[var(--auth-muted)]">
          <Link href="/legal/terms" className="text-[var(--auth-link)] hover:underline">
            Terms of Use
          </Link>
          <span aria-hidden className="text-[var(--auth-muted)] opacity-60">
            ·
          </span>
          <Link href="/legal/privacy" className="text-[var(--auth-link)] hover:underline">
            Privacy Policy
          </Link>
          <span aria-hidden className="text-[var(--auth-muted)] opacity-60">
            ·
          </span>
          <Link href="/contact-admin" className="text-[var(--auth-link)] hover:underline">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
