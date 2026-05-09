import Link from "next/link";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-saas flex min-h-screen flex-col bg-[var(--auth-bg)]">
      <header className="shrink-0 bg-[var(--header)] px-4 py-8 text-[var(--header-fg)] sm:py-10">
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-[var(--header-fg)]"
          >
            Pharm<span className="text-[var(--primary-soft)]">LMS</span>
          </Link>
          <p className="text-xs leading-relaxed text-[var(--header-fg-muted)] sm:text-[13px]">
            Secure sign-in for your learning workspace.
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-12 pt-8">
        <div className="mx-auto w-full max-w-[400px] flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          {children}
        </div>
      </main>

      <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6">
        <div className="mx-auto flex w-full max-w-[400px] flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-[var(--muted-soft)]">
          <Link
            href="/legal/terms"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Terms of Use
          </Link>
          <span aria-hidden className="text-[var(--border)]">
            ·
          </span>
          <Link
            href="/legal/privacy"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Privacy Policy
          </Link>
          <span aria-hidden className="text-[var(--border)]">
            ·
          </span>
          <Link
            href="/contact-admin"
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
