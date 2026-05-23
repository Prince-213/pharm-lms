import { getLandingContent, type LandingAudience } from "@/lib/landing-content";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type TutorsSectionProps = {
  audience?: LandingAudience;
};

export function TutorsSection({ audience = "student" }: TutorsSectionProps) {
  const { people } = getLandingContent(audience);

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-[90%] lg:w-[80%] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--emerald)]">
            {people.eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold text-[var(--ink-deep)] sm:text-4xl">
            {people.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted-soft)]">{people.description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {people.members.map((person) => (
            <div
              key={person.name}
              className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-[var(--shadow-1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-3)]"
            >
              <img
                src={person.avatar}
                alt={person.name}
                className="mb-4 h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <h3 className="font-display text-base font-bold text-[var(--ink-deep)]">
                {person.name}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-snug text-[var(--emerald)]">
                {person.title}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                {person.bio}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#"
                  aria-label={`${person.name} on Twitter`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <TwitterIcon className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label={`${person.name} on LinkedIn`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
