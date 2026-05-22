export function PartnersSection() {
  const partners = ["duolingo", "Codecov", "UserTesting", "magic leap"];

  return (
    <section className="bg-transparent py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:px-6 lg:px-10">
        <div className="mr-8 shrink-0">
          <p className="font-display text-2xl font-extrabold text-[var(--emerald)]">250+</p>
          <p className="text-sm text-slate-500">Collaboration</p>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-around gap-6 opacity-60">
          {/* Duolingo */}
          <span className="font-display text-2xl font-bold text-slate-400 tracking-tight">
            duolingo
          </span>

          {/* Codecov */}
          <span className="flex items-center gap-1.5 font-semibold text-slate-400 text-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity=".3"/>
              <path d="M12 6a6 6 0 100 12A6 6 0 0012 6z" fill="currentColor"/>
            </svg>
            Codecov
          </span>

          {/* UserTesting */}
          <span className="rounded border border-slate-300 px-2 py-0.5 text-sm font-bold text-slate-400">
            User<span className="text-slate-500">Testing</span>
          </span>

          {/* Magic Leap */}
          <span className="flex items-center gap-1.5 font-semibold text-slate-400 text-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="8" cy="12" r="5"/>
              <circle cx="16" cy="12" r="3" opacity=".5"/>
            </svg>
            magic leap
          </span>
        </div>
      </div>
    </section>
  );
}
