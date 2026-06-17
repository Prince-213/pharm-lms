import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const studentAvatars = [
  { src: "/assets/mentor.jpg", alt: "PharmLMS student" },
  { src: "/assets/tutor.jpg", alt: "PharmLMS student" },
  { src: "/assets/categories/private-monitoring.jpg", alt: "PharmLMS student" },
] as const;

export function EmpowerSection() {
  return (
    <section id="empower" className="w-full">
      <div className="grid min-h-0 sm:min-h-[480px] lg:min-h-[640px] lg:grid-cols-2">
        <div className="relative min-h-[360px] lg:min-h-full">
          <Image
            src="/assets/kevin-ku-w7ZyuGYNpRQ-unsplash.jpg"
            alt="Student learning with a tablet at home"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          <div className="absolute bottom-8 left-38 z-10 flex items-center gap-4 rounded-[16px] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
            <div className="min-w-0">
              <div className=" flex items-center gap-3">
                <Image
                  src={"/assets/satisfied.png"}
                  alt={"satisfied"}
                  width={70}
                  height={70}
                />
                <p className="text-5xl font-bold leading-none text-black">
                  45K+
                </p>
              </div>
              <p className="mt-3 text-sm leading-[1.2] font-medium text-[#5A536C]">
                Happy Students Worldwide
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center bg-[var(--emerald)] px-8 py-16 sm:px-12 lg:px-[72px] lg:py-[88px]">
          <div className="relative z-10 w-[80%]">
            <h2 className="text-4xl font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[48px] lg:text-5xl">
              <span className="relative inline-block">
                <span className="relative inline-block">
                  <span className="relative z-[1]">Empower</span>
                  <Image
                    src="/assets/hightlight-crown.svg"
                    alt=""
                    width={50}
                    height={16}
                    className="pointer-events-none absolute -bottom-[16px] left-0 z-0 h-auto w-[100%] max-w-none"
                    aria-hidden
                  />
                </span>
              </span>{" "}
              Your Learning Journey From Anywhere
            </h2>

            <div className="mt-8 space-y-5 text-sm leading-[1.75] text-white/95 font-medium">
              <p>
                PharmLMS is dedicated to equipping African pharmacists with the
                data, technology, and health innovation skills needed to compete
                for digital health roles.
              </p>
              <p>
                As Africa's first pharmacy-specific platform, we create an
                inclusive learning environment built around clinical contexts
                and real-world case studies that encourage growth and success.
              </p>
            </div>

            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-[15px] font-semibold text-white transition hover:bg-[#111111]"
            >
              Learn More About Us
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Link>
          </div>

          <Image
            src="/assets/shape21.png"
            alt=""
            width={76}
            height={76}
            className="pointer-events-none absolute md:bottom-8 md:right-38 z-0 h-[76px] w-[76px] object-contain bottom-10 right-10 sm:h-[76px] sm:w-[76px]"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
