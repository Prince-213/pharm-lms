import Image from "next/image";
import Link from "next/link";
import {
  cmsTutorImageSrc,
  getTutorsCms,
} from "@/lib/cms/tutors";

export function LeadingProfessionalsSection() {
  const { leadingProfessionals, tutors } = getTutorsCms();

  return (
    <section
      id="leading-professionals"
      className="relative overflow-hidden bg-[var(--background)] py-14 md:py-16 lg:py-16 xl:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
          <div className="relative inline-block">
            <h2 className="font-display w-[90%] text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[30px] md:w-[80%] md:text-[32px] lg:text-[36px] xl:text-[48px]">
              <span className="relative inline-block">
                <span className="relative inline-block px-1">
                  <span className="relative z-[1]">{leadingProfessionals.highlight}</span>
                  <Image
                    src="/assets/hightlight-crown.svg"
                    alt=""
                    width={92}
                    height={56}
                    className="pointer-events-none absolute -bottom-[8px] left-1/2 z-0 h-auto w-[118%] max-w-none -translate-x-1/2"
                    aria-hidden
                  />
                </span>
              </span>{" "}
              {leadingProfessionals.title}
            </h2>
          </div>

          <Link
            href={leadingProfessionals.ctaHref}
            className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[var(--emerald)] px-7 py-4.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-strong)] hover:shadow-[0_12px_32px_rgba(0,0,128,0.35)]"
          >
            {leadingProfessionals.ctaLabel}
          </Link>
        </div>

        <div className="mx-auto flex w-full flex-col items-center gap-[6%] sm:flex-row sm:items-start sm:justify-center sm:gap-[5%]">
          {tutors.map((person) => (
            <figure
              key={person.id}
              className="relative w-[70%] shrink-0 overflow-hidden rounded-full bg-slate-100 shadow-lg sm:w-[42%] md:w-[40%] lg:w-[34%] xl:w-[38%]"
              style={{ aspectRatio: "1 / 1.85" }}
            >
              <Image
                src={cmsTutorImageSrc(person.image)}
                alt={person.name}
                fill
                sizes="38vw"
                className="h-full w-full object-cover"
                style={{ objectPosition: person.objectPosition ?? "50% 22%" }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-[8%] pb-[10%] pt-[22%] text-center">
                <p className="font-display text-[clamp(0.95rem,2.2vw,1.25rem)] font-bold text-white">
                  {person.name}
                </p>
                {person.title ? (
                  <p className="mt-[2%] text-[clamp(0.75rem,1.6vw,0.9rem)] font-medium text-white/80">
                    {person.title}
                  </p>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
