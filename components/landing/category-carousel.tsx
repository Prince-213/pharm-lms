"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const getVisibleCount = (): number => {
  if (typeof window === "undefined") return 2;
  if (window.innerWidth >= 1024) return 4;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

const CARD_GAP = 26;
const IMAGE_ASPECT = 282 / 215;

const categories = [
  {
    label: "Tutor Availability",
    href: "/courses",
    image: "/assets/categories/tutor-availability.jpg",
    imageAlt: "Tutor working at a desk with a laptop",
  },
  {
    label: "Private Monitoring",
    href: "/courses",
    image: "/assets/categories/private-monitoring.jpg",
    imageAlt: "Professional reviewing coursework on a laptop",
  },
  {
    label: "Creative Thinking",
    href: "/courses",
    image: "/assets/categories/creative-thinking.jpg",
    imageAlt: "Mentor and student reading together",
  },
  {
    label: "Affordable Prices",
    href: "/courses",
    image: "/assets/categories/affordable-prices.jpg",
    imageAlt: "Student taking notes in a notebook",
  },
  {
    label: "Clinical Skills",
    href: "/courses?category=Clinical",
    image: "/assets/categories/clinical-skills.jpg",
    imageAlt: "Clinical pharmacy learning session",
  },
  {
    label: "Drug Safety",
    href: "/courses?category=Safety",
    image: "/assets/categories/drug-safety.jpg",
    imageAlt: "Pharmacist reviewing safety protocols",
  },
  {
    label: "Patient Care",
    href: "/courses?category=Therapeutics",
    image: "/assets/categories/patient-care.jpg",
    imageAlt: "Healthcare professional supporting a patient",
  },
  {
    label: "Licensing Prep",
    href: "/courses?category=Licensure",
    image: "/assets/categories/licensing-prep.jpg",
    imageAlt: "Student preparing for licensure exams",
  },
] as const;

export function CategoryCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);

  const maxIndex = Math.max(0, categories.length - visibleCount);
  const imageHeight = cardWidth > 0 ? cardWidth / IMAGE_ASPECT : 0;

  const updateMeasurements = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>("[data-category-card]");
    if (firstCard) {
      setCardWidth(firstCard.offsetWidth);
      setVisibleCount(getVisibleCount());
    }
  }, []);

  useEffect(() => {
    updateMeasurements();
    const onResize = () => updateMeasurements();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateMeasurements]);

  useEffect(() => {
    setActiveIndex(0);
  }, [visibleCount]);

  const slideBy = (direction: -1 | 1) => {
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
  };

  const translateX = activeIndex * (cardWidth + CARD_GAP);

  return (
    <section
      id="category"
      className="w-full  pb-[72px]"
      aria-label="Course categories"
    >
      <div className="relative mx-auto w-full max-w-[1328px] px-4 sm:w-[92%] sm:px-0">
        <div className="relative">
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-[26px] transition-transform duration-500 ease-out will-change-transform"
              style={{
                transform: cardWidth
                  ? `translate3d(-${translateX}px, 0, 0)`
                  : undefined,
              }}
            >
              {categories.map((category, index) => (
                <Link
                  key={category.label}
                  href={category.href}
                  data-category-card
                  className="group min-w-0 shrink-0 basis-[calc(100%+26px)] sm:basis-[calc((100%-26px)/2)] lg:basis-[calc((100%-78px)/4)]"
                >
                  <div
                    className={`relative aspect-[282/215] overflow-hidden rounded-[14px] transition-transform duration-500 ${
                      index === activeIndex ? "scale-[1.02]" : "scale-100"
                    }`}
                  >
                    <Image
                      src={category.image}
                      alt={category.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-[14px] text-left text-sm font-bold leading-[1.2] text-black sm:text-base lg:text-[18px]">
                    {category.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {imageHeight > 0 && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{ height: imageHeight }}
            >
              <button
                type="button"
                aria-label="Previous categories"
                onClick={() => slideBy(-1)}
                className="pointer-events-auto absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
              >
                <CaretLeft className="h-[18px] w-[18px]" weight="bold" />
              </button>

              <button
                type="button"
                aria-label="Next categories"
                onClick={() => slideBy(1)}
                className="pointer-events-auto absolute right-0 top-1/2 z-10 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
              >
                <CaretRight className="h-[18px] w-[18px]" weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
