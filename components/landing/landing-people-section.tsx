import Image from "next/image";
import Link from "next/link";
import type { LandingPersonView } from "@/lib/landing/load-landing-data";

type LandingPeopleSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  people: LandingPersonView[];
  profileCta?: string;
};

export function LandingPeopleSection({
  eyebrow,
  title,
  description,
  people,
  profileCta = "View profile",
}: LandingPeopleSectionProps) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--emerald)]">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold text-[var(--ink-deep)] sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted-soft)]">
            {description}
          </p>
        </div>

        {people.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((person) => (
              <Link
                key={person.id}
                href={person.href}
                className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-[var(--shadow-1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-3)]"
              >
                <Image
                  src={person.avatar}
                  alt={person.name}
                  width={80}
                  height={80}
                  className="mb-4 h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
                  unoptimized={person.avatar.startsWith("http")}
                />
                <h3 className="font-display text-base font-bold text-[var(--ink-deep)]">
                  {person.name}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-snug text-[var(--emerald)]">
                  {person.title}
                </p>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                  {person.bio}
                </p>
                <span className="mt-5 text-sm font-semibold text-[var(--emerald)] group-hover:underline">
                  {profileCta} →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-[var(--muted-soft)]">
            No profiles to show yet. Check back soon.
          </div>
        )}
      </div>
    </section>
  );
}
