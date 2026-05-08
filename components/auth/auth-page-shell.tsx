import Link from "next/link";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-[var(--shadow-sm)] backdrop-blur-[var(--header-blur)]">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[var(--foreground)]">Pharm</span>
            <span className="text-[var(--primary)]">LMS</span>
          </Link>
          <p className="hidden text-xs text-[var(--muted)] sm:block">Secure sign-in</p>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:py-16">
        <section className="hidden md:flex md:items-center md:justify-center">
          <div className="relative w-full max-w-[400px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-gradient-to-br from-[var(--primary-soft)] via-[var(--surface)] to-[var(--surface-muted)] p-10 shadow-[var(--shadow-md)]">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--primary)]/10" aria-hidden />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[var(--primary)]/15" aria-hidden />
            <div className="relative space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Pharmacy learning</p>
              <h2 className="text-2xl font-bold leading-tight text-[var(--foreground)]">
                Evidence-based courses, structured for busy clinicians.
              </h2>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                Progress tracking, curated curriculum, and a calm interface so you can focus on patient-centered care.
              </p>
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-[400px]">{children}</section>
      </main>
    </div>
  );
}
