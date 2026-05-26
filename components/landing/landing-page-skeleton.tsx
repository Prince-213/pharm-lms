import { clsx } from "clsx";

const pulse = "animate-pulse bg-slate-200/80";

function Bone({ className }: { className?: string }) {
  return <div className={clsx(pulse, "rounded-md", className)} aria-hidden />;
}

function SectionEyebrowTitle() {
  return (
    <div className="mb-10 text-center">
      <Bone className="mx-auto h-3 w-28 rounded-full" />
      <Bone className="mx-auto mt-4 h-9 w-72 max-w-full rounded-lg sm:h-10" />
      <Bone className="mx-auto mt-3 h-4 w-96 max-w-full rounded-md" />
    </div>
  );
}

function LandingNavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-[99%] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-10">
        <div className="flex w-[65%] items-center gap-4">
          <Bone className="h-8 w-32 shrink-0 rounded-lg" />
          <Bone className="hidden h-10 flex-1 rounded-full md:block" />
        </div>
        <div className="flex items-center gap-3">
          <Bone className="hidden h-9 w-24 rounded-lg sm:block" />
          <Bone className="hidden h-9 w-24 rounded-lg sm:block" />
          <Bone className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </header>
  );
}

function HeroSectionSkeleton() {
  return (
    <section className="relative overflow-x-hidden bg-gradient-to-br from-emerald-50/60 via-white to-white py-8 lg:py-16">
      <div className="relative mx-auto grid w-[90%] items-center gap-12 px-4 sm:px-6 lg:w-[80%] lg:grid-cols-2 lg:gap-8 lg:px-10">
        <div className="space-y-5">
          <Bone className="h-12 w-full max-w-lg rounded-lg sm:h-14" />
          <Bone className="h-12 w-[85%] max-w-md rounded-lg sm:h-14" />
          <Bone className="mt-2 h-5 w-full max-w-lg rounded-md" />
          <Bone className="h-5 w-[90%] max-w-md rounded-md" />
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:gap-5">
            <Bone className="h-12 w-40 rounded-lg lg:rounded-xl" />
            <Bone className="h-12 w-44 rounded-lg lg:rounded-xl" />
          </div>
          <div className="mt-12 flex flex-wrap gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Bone className="h-8 w-8 rounded-lg" />
                <Bone className="h-4 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:max-w-none">
          <Bone className="relative h-[350px] w-[350px] rounded-full lg:h-[550px] lg:w-[550px]" />
          <Bone className="absolute left-0 top-40 h-16 w-36 -translate-x-5 rounded-[10px] lg:rounded-[18px]" />
          <Bone className="absolute -top-4 right-0 h-28 w-28 rounded-[10px] lg:right-2 lg:rounded-[18px]" />
          <Bone className="absolute bottom-4 right-0 h-16 w-32 rounded-[10px] lg:right-10 lg:rounded-[18px]" />
        </div>
      </div>

      <div className="mx-auto mt-16 flex w-[90%] max-w-7xl flex-wrap items-center gap-6 px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <div className="mr-8 shrink-0 space-y-2">
          <Bone className="h-8 w-16 rounded-md" />
          <Bone className="h-4 w-24 rounded-md" />
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-around gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-6 w-24 rounded-md" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSectionSkeleton() {
  return (
    <section className="bg-white py-16 lg:py-16">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <SectionEyebrowTitle />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-[var(--shadow-1)]"
            >
              <Bone className="h-12 w-12 rounded-xl" />
              <Bone className="mt-5 h-6 w-3/4 rounded-md" />
              <Bone className="mt-3 h-4 w-full rounded-md" />
              <Bone className="mt-2 h-4 w-[90%] rounded-md" />
              <Bone className="mt-2 h-4 w-[70%] rounded-md" />
              <Bone className="mt-6 h-4 w-24 rounded-md" />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <Bone className="h-2.5 w-7 rounded-full" />
          <Bone className="h-2.5 w-2.5 rounded-full" />
          <Bone className="h-2.5 w-2.5 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function PopularCoursesSectionSkeleton() {
  return (
    <section className="bg-slate-50/50 py-16 lg:py-20">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <div className="mb-10">
          <Bone className="h-3 w-28 rounded-full" />
          <Bone className="mt-4 h-9 w-64 max-w-full rounded-lg sm:h-10" />
          <Bone className="mt-3 h-4 w-full max-w-lg rounded-md" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[var(--shadow-1)]"
            >
              <Bone className="h-48 w-full rounded-none" />
              <div className="flex flex-1 flex-col p-5">
                <Bone className="h-3 w-20 rounded-full" />
                <Bone className="mt-3 h-5 w-[85%] rounded-md" />
                <Bone className="mt-2 h-4 w-full rounded-md" />
                <Bone className="mt-2 h-4 w-full rounded-md" />
                <Bone className="mt-3 h-4 w-32 rounded-md" />
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <Bone className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Bone className="h-4 w-24 rounded-md" />
                    <Bone className="h-3 w-16 rounded-md" />
                  </div>
                  <Bone className="h-6 w-14 shrink-0 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <Bone className="h-2.5 w-7 rounded-full" />
          <Bone className="h-2.5 w-2.5 rounded-full" />
        </div>
        <div className="mt-8 flex justify-center">
          <Bone className="h-11 w-40 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

function TutorsSectionSkeleton() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <SectionEyebrowTitle />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-[var(--shadow-1)]"
            >
              <Bone className="mb-4 h-20 w-20 rounded-full" />
              <Bone className="h-5 w-32 rounded-md" />
              <Bone className="mt-2 h-4 w-28 rounded-md" />
              <Bone className="mt-3 h-4 w-full rounded-md" />
              <Bone className="mt-2 h-4 w-[85%] rounded-md" />
              <div className="mt-5 flex gap-3">
                <Bone className="h-8 w-8 rounded-full" />
                <Bone className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSectionSkeleton() {
  return (
    <section className="bg-emerald-50/50 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <div className="mb-8 flex justify-center">
          <Bone className="h-8 w-36 rounded-lg" />
        </div>
        <Bone className="mx-auto h-8 w-full max-w-2xl rounded-lg sm:h-10" />
        <Bone className="mx-auto mt-3 h-8 w-[90%] max-w-xl rounded-lg sm:h-10" />
        <div className="mt-8 flex flex-col items-center gap-2">
          <Bone className="h-14 w-14 rounded-full" />
          <Bone className="h-5 w-32 rounded-md" />
          <Bone className="h-4 w-40 rounded-md" />
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <Bone className="h-2.5 w-7 rounded-full" />
          <Bone className="h-2.5 w-2.5 rounded-full" />
          <Bone className="h-2.5 w-2.5 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function BlogSectionSkeleton() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <Bone className="mb-8 h-8 w-48 rounded-lg sm:h-9" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-6 lg:flex-row">
                <Bone className="h-[200px] min-w-0 shrink-0 rounded-lg lg:min-w-[320px] lg:w-[320px]" />
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="space-y-3">
                    <Bone className="h-4 w-24 rounded-md" />
                    <Bone className="h-6 w-full rounded-md" />
                    <Bone className="h-4 w-full rounded-md" />
                    <Bone className="h-4 w-[85%] rounded-md" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Bone className="h-6 w-16 rounded-full" />
                    <Bone className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-6 lg:flex-col">
            <div className="space-y-3">
              <Bone className="h-4 w-24 rounded-md" />
              <Bone className="h-7 w-full rounded-md" />
              <Bone className="h-4 w-full rounded-md" />
              <Bone className="h-4 w-[90%] rounded-md" />
              <div className="flex gap-2 pt-2">
                <Bone className="h-6 w-16 rounded-full" />
                <Bone className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <Bone className="h-[220px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooterSkeleton() {
  return (
    <footer className="bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-1">
            <Bone className="h-7 w-32 rounded-md bg-slate-700/80" />
            <Bone className="h-4 w-full max-w-xs rounded-md bg-slate-700/60" />
            <Bone className="h-4 w-[80%] max-w-xs rounded-md bg-slate-700/60" />
          </div>
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="space-y-4">
              <Bone className="h-3 w-16 rounded-md bg-slate-700/80" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((row) => (
                  <Bone
                    key={row}
                    className="h-4 w-20 rounded-md bg-slate-700/50"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-10">
          <Bone className="h-3 w-48 rounded-md bg-slate-700/50" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Bone key={i} className="h-4 w-4 rounded-full bg-slate-700/50" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Full homepage loading UI — mirrors hero → services → courses → tutors → testimonial → blog → footer */
export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <span className="sr-only">Loading homepage</span>
      <LandingNavbarSkeleton />
      <main>
        <HeroSectionSkeleton />
        <ServicesSectionSkeleton />
        <PopularCoursesSectionSkeleton />
        <TutorsSectionSkeleton />
        <TutorsSectionSkeleton />
        <TestimonialSectionSkeleton />
        <BlogSectionSkeleton />
      </main>
      <LandingFooterSkeleton />
    </div>
  );
}
