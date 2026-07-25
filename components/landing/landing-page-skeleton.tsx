import { clsx } from "clsx";

const pulse = "animate-pulse bg-[var(--surface-muted)]";

function Bone({ className }: { className?: string }) {
  return <div className={clsx(pulse, "rounded-md", className)} aria-hidden />;
}

/** Matches HomeHeroSection: centered badge, title, search bar, trust row */
function HomeHeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white py-14 lg:py-20">
      <div className="mx-auto flex w-[90%] max-w-3xl flex-col items-center gap-5 text-center lg:w-[60%]">
        <Bone className="h-7 w-40 rounded-full" />
        <Bone className="h-12 w-full max-w-xl rounded-lg sm:h-14" />
        <Bone className="h-6 w-[85%] max-w-lg rounded-md" />
        <div className="mt-2 flex w-full max-w-xl items-stretch gap-0 overflow-hidden rounded-xl border border-[var(--border)] bg-white p-1 shadow-sm">
          <Bone className="h-12 w-32 shrink-0 rounded-lg" />
          <Bone className="h-12 flex-1 rounded-lg" />
          <Bone className="h-12 w-12 shrink-0 rounded-lg" />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Bone className="h-5 w-5 rounded-full" />
              <Bone className="h-4 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCarouselSkeleton() {
  return (
    <section className="border-y border-[var(--border)] bg-white py-8">
      <div className="mx-auto flex w-[90%] gap-4 overflow-hidden lg:w-[80%]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Bone key={i} className="h-24 w-40 shrink-0 rounded-xl" />
        ))}
      </div>
    </section>
  );
}

function EmpowerSkeleton() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto grid w-[90%] items-center gap-10 lg:w-[80%] lg:grid-cols-2">
        <Bone className="aspect-[4/3] w-full rounded-2xl" />
        <div className="space-y-4">
          <Bone className="h-3 w-28 rounded-full" />
          <Bone className="h-9 w-full max-w-md rounded-lg" />
          <Bone className="h-4 w-full rounded-md" />
          <Bone className="h-4 w-[90%] rounded-md" />
          <Bone className="mt-4 h-11 w-40 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

function FeaturedCoursesSkeleton() {
  return (
    <section className="bg-[#EFEFEF] py-16 lg:py-20">
      <div className="mx-auto w-[90%] lg:w-[80%]">
        <Bone className="mb-8 h-9 w-64 rounded-lg" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
            >
              <Bone className="h-44 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Bone className="h-5 w-[85%] rounded-md" />
                <Bone className="h-4 w-32 rounded-md" />
                <Bone className="h-4 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySkeleton() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto grid w-[90%] items-center gap-10 lg:w-[80%] lg:grid-cols-2">
        <div className="space-y-4">
          <Bone className="h-9 w-3/4 rounded-lg" />
          <Bone className="h-4 w-full rounded-md" />
          <Bone className="h-4 w-[90%] rounded-md" />
          <Bone className="mt-4 h-11 w-36 rounded-xl" />
        </div>
        <Bone className="aspect-[4/3] w-full rounded-2xl" />
      </div>
    </section>
  );
}

function TestimonialSkeleton() {
  return (
    <section className="bg-emerald-50/40 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
        <Bone className="h-16 w-16 rounded-full" />
        <Bone className="h-8 w-full max-w-2xl rounded-lg" />
        <Bone className="h-8 w-[80%] max-w-xl rounded-lg" />
        <Bone className="h-5 w-40 rounded-md" />
      </div>
    </section>
  );
}

function ProfessionalsSkeleton() {
  return (
    <section className="py-16">
      <div className="mx-auto w-[90%] lg:w-[80%]">
        <Bone className="mx-auto mb-10 h-9 w-72 rounded-lg" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6"
            >
              <Bone className="mb-4 h-20 w-20 rounded-full" />
              <Bone className="h-5 w-28 rounded-md" />
              <Bone className="mt-2 h-4 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSkeleton() {
  return (
    <section className="bg-[var(--surface-muted)] py-16">
      <div className="mx-auto grid w-[90%] gap-10 lg:w-[80%] lg:grid-cols-2">
        <Bone className="aspect-square w-full max-w-md rounded-2xl" />
        <div className="space-y-3">
          <Bone className="h-8 w-48 rounded-lg" />
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSkeleton() {
  return (
    <section className="py-16">
      <div className="mx-auto grid w-[90%] gap-8 rounded-2xl bg-[var(--header)] p-8 lg:w-[80%] lg:grid-cols-2 lg:p-12">
        <div className="space-y-3">
          <Bone className="h-8 w-64 rounded-lg bg-white/20" />
          <Bone className="h-4 w-full max-w-sm rounded-md bg-white/15" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-12 flex-1 rounded-xl bg-white/20" />
          <Bone className="h-12 w-28 rounded-xl bg-white/25" />
        </div>
      </div>
    </section>
  );
}

/** Homepage body only — layout already mounts LandingHeader / LandingFooter */
export function LandingPageContentSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <span className="sr-only">Loading homepage</span>
      <HomeHeroSkeleton />
      <CategoryCarouselSkeleton />
      <EmpowerSkeleton />
      <FeaturedCoursesSkeleton />
      <JourneySkeleton />
      <TestimonialSkeleton />
      <ProfessionalsSkeleton />
      <FaqSkeleton />
      <NewsletterSkeleton />
    </div>
  );
}

/** Full-page variant (standalone, includes fake chrome — prefer content-only under marketing layout) */
export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LandingPageContentSkeleton />
    </div>
  );
}

/** Kept for Suspense fallbacks that only need a course grid strip */
export function PopularCoursesSectionSkeleton() {
  return <FeaturedCoursesSkeleton />;
}
