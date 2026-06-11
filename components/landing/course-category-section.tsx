import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "IT And Software",
    count: 25,
    icon: "/assets/categories1.svg",
    href: "/courses?category=IT%20And%20Software",
  },
  {
    title: "Sales Marketing",
    count: 56,
    icon: "/assets/categories2.svg",
    href: "/courses?category=Sales%20Marketing",
  },
  {
    title: "Art & Humanities",
    count: 19,
    icon: "/assets/categories3.svg",
    href: "/courses?category=Art%20%26%20Humanities",
  },
  {
    title: "Mobile Application",
    count: 40,
    icon: "/assets/categories4.svg",
    href: "/courses?category=Mobile%20Application",
  },
  {
    title: "Graphic Design",
    count: 35,
    icon: "/assets/categories5.svg",
    href: "/courses?category=Graphic%20Design",
  },
  {
    title: "Web Design",
    count: 20,
    icon: "/assets/categories6.svg",
    href: "/courses?category=Web%20Design",
  },
] as const;

export function CourseCategorySection() {
  return (
    <section
      id="course-category"
      className="w-full bg-[#F8F9FA] py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1328px] px-4 sm:w-[92%] sm:px-0">
        <h2 className="text-center text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[40px] lg:text-[44px]">
          <span className="relative inline-block">
            <span className="relative inline-block px-1">
              <span className="relative z-[1]">40K+</span>
              <Image
                src="/assets/hightlight-crown.svg"
                alt=""
                width={120}
                height={14}
                className="pointer-events-none absolute -bottom-[4px] left-1/2 z-0 h-auto w-[108%] max-w-none -translate-x-1/2"
                aria-hidden
              />
            </span>
          </span>{" "}
          Free Courses Online
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group flex flex-col items-center rounded-[14px] bg-white px-6 py-9 text-center shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition hover:shadow-[0_8px_32px_rgba(15,23,42,0.08)]"
            >
              <div className="relative mb-7 flex h-[92px] w-full items-start justify-center">
                <Image
                  src="/assets/dot.png"
                  alt=""
                  width={120}
                  height={48}
                  className="pointer-events-none absolute bottom-0 left-1/2 h-auto w-[112px] max-w-none -translate-x-1/2 object-contain opacity-90"
                  aria-hidden
                />
                <div className="relative z-10 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[var(--emerald)]">
                  <Image
                    src={category.icon}
                    alt=""
                    width={30}
                    height={30}
                    aria-hidden
                  />
                </div>
              </div>

              <h3 className="text-[15px] font-bold leading-[1.3] text-black sm:text-[17px]">
                {category.title}
              </h3>

              <p className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-[#555555] transition-colors group-hover:text-[var(--emerald)] sm:text-[15px]">
                {category.count} Courses
                <span aria-hidden>→</span>
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex justify-center lg:mt-16">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--emerald)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] sm:px-8 sm:py-4 sm:text-[15px]"
          >
            Explore All Categories
            <Image
              src="/assets/right-arrow.svg"
              alt=""
              width={18}
              height={18}
              className="brightness-0 invert"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
