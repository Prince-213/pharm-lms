import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  {
    value: "13K",
    label: "Courses Offered",
    icon: "/assets/counter1.svg",
  },
  {
    value: "30K",
    label: "Instructors",
    icon: "/assets/counter2.svg",
  },
  {
    value: "9K",
    label: "Certified Course",
    icon: "/assets/counter3.svg",
  },
  {
    value: "3.5M",
    label: "Students Enrolled",
    icon: "/assets/counter4.svg",
  },
] as const;

export function JourneySection() {
  return (
    <section id="journey" className="w-full  py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1328px] px-4 sm:w-[92%] sm:px-0">
        <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,660px)] lg:gap-10 xl:gap-14">
          <div className="relative z-10 max-w-[560px]">
            <h2 className="text-[34px] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[40px] lg:text-[44px]">
              <span className="relative inline-block">
                <span className="relative inline-block px-1">
                  <span className="relative z-[1]">Your</span>
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
              Learning Journey Starts Here
            </h2>

            <div className="mt-8 space-y-5 text-sm font-medium leading-[1.75] text-[#666666] sm:text-[15px]">
              <p>
                Embark on a personalized learning path designed to help you
                achieve your career goals, gain new skills, and explore
                innovative knowledge areas.
              </p>
              <p>
                Our platform offers curated courses, expert guidance, and
                interactive resources to make learning both engaging and
                effective. Take the first step towards mastery today.
              </p>
            </div>

            <Link
              href="/courses"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#111111] sm:px-8 sm:py-4 sm:text-[15px]"
            >
              Browse All Courses
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Link>
          </div>

          <Image
            src="/assets/shape12.png"
            alt=""
            width={72}
            height={69}
            className="pointer-events-none absolute left-[42%] top-[58%] z-20 hidden h-[69px] w-[72px] object-contain lg:block xl:left-[44%] xl:top-[56%]"
            aria-hidden
          />

          <div className="relative z-10 flex justify-center lg:justify-end">
            <Image
              src="/assets/journey.png"
              alt="Students and learners studying with tablets and laptops"
              width={660}
              height={514}
              className="h-auto w-full max-w-[660px] object-contain"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-20 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-[14px] bg-white px-6 py-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
            >
              <Image
                src={stat.icon}
                alt=""
                width={68}
                height={68}
                className="h-[68px] w-[68px] shrink-0"
                aria-hidden
              />
              <div>
                <p className="text-xl font-bold leading-none text-black sm:text-2xl lg:text-[28px]">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-bold text-black">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
