import { clsx } from "clsx";

const pulse = "animate-pulse bg-[var(--surface-muted)]";

function Bone({ className }: { className?: string }) {
  return <div className={clsx(pulse, "rounded-md", className)} aria-hidden />;
}

const shell = "mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12 xl:px-16";

function HomeHeroSkeleton() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(160deg, var(--primary-strong) 0%, var(--primary) 58%, var(--primary-strong) 100%)",
      }}
    >
      <div className={`${shell} pt-12 md:pt-16 xl:pt-[88px]`}>
        <div className="flex flex-wrap items-center gap-10 xl:gap-12">
          <div className="flex min-w-0 flex-1 basis-[480px] flex-col gap-6">
            <Bone className="h-3 w-64 rounded-sm bg-white/20" />
            <Bone className="h-14 w-full max-w-lg rounded-lg bg-white/20 sm:h-16" />
            <Bone className="h-4 w-[90%] max-w-md rounded-md bg-white/15" />
            <div className="flex w-full max-w-[600px] gap-1 rounded-2xl bg-white p-1.5">
              <Bone className="h-12 w-36 shrink-0 rounded-[11px]" />
              <Bone className="h-12 flex-1 rounded-[11px]" />
              <Bone className="h-12 w-24 shrink-0 rounded-[11px] bg-[var(--primary-soft)]" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Bone className="h-12 w-44 rounded-full bg-accent/50" />
              <Bone className="h-12 w-40 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="mx-auto w-full max-w-[520px] flex-1 basis-[380px] rounded-[20px] border border-white/20 bg-white/8 p-6">
            <Bone className="mb-4 h-3 w-40 rounded-sm bg-white/20" />
            <Bone className="mb-6 h-6 w-72 rounded-md bg-white/25" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="mb-4 flex items-center gap-3 last:mb-0">
                <Bone className="size-[26px] shrink-0 rounded-full bg-white/25" />
                <Bone className="h-4 flex-1 rounded-md bg-white/15" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap border-t border-white/18">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex min-w-0 flex-1 basis-[200px] flex-col gap-2 py-7">
              <Bone className="h-8 w-20 rounded-md bg-white/25" />
              <Bone className="h-3 w-36 rounded-sm bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoSkeleton() {
  return (
    <section className="py-16">
      <div className={shell}>
        <Bone className="mb-8 h-10 w-80 max-w-full" />
        <div className="grid gap-4 lg:grid-cols-12">
          <Bone className="h-56 rounded-xl lg:col-span-6" />
          <Bone className="h-56 rounded-xl lg:col-span-3" />
          <Bone className="h-56 rounded-xl lg:col-span-3" />
        </div>
      </div>
    </section>
  );
}

function FeaturedCoursesSkeleton() {
  return (
    <section className="bg-muted py-16">
      <div className={shell}>
        <Bone className="mb-8 h-10 w-72" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[14px] bg-white p-5">
              <Bone className="aspect-[412/248] w-full rounded-[10px]" />
              <Bone className="mt-5 h-5 w-[80%]" />
              <Bone className="mt-3 h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PathwaySkeleton() {
  return (
    <section className="py-16">
      <div className={`${shell} space-y-6`}>
        <Bone className="h-10 w-96 max-w-full" />
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Bone key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <Bone className="h-64 rounded-2xl lg:col-span-7" />
          <Bone className="h-64 rounded-2xl lg:col-span-5" />
        </div>
      </div>
    </section>
  );
}

function CareersSkeleton() {
  return (
    <section className="bg-primary py-16">
      <div className={`${shell} grid gap-10 lg:grid-cols-2`}>
        <div className="space-y-4">
          <Bone className="h-8 w-64 bg-white/20" />
          <Bone className="h-4 w-full bg-white/15" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-16 bg-white/15" />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSkeleton() {
  return (
    <section className="bg-muted py-16">
      <div className={`${shell} grid gap-8 lg:grid-cols-12`}>
        <Bone className="h-10 w-72 lg:col-span-5" />
        <div className="space-y-3 lg:col-span-7">
          {[1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-16 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSkeleton() {
  return (
    <section className="bg-primary py-16">
      <div className={`${shell} grid gap-8 lg:grid-cols-12`}>
        <div className="space-y-3 lg:col-span-7">
          <Bone className="h-12 w-80 max-w-full bg-white/20" />
          <Bone className="h-4 w-full max-w-md bg-white/15" />
        </div>
        <Bone className="h-48 rounded-2xl bg-white/10 lg:col-span-5" />
      </div>
    </section>
  );
}

export function LandingPageContentSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <span className="sr-only">Loading homepage</span>
      <HomeHeroSkeleton />
      <WhoSkeleton />
      <FeaturedCoursesSkeleton />
      <PathwaySkeleton />
      <CareersSkeleton />
      <FaqSkeleton />
      <FinalCtaSkeleton />
    </div>
  );
}

export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LandingPageContentSkeleton />
    </div>
  );
}

export function PopularCoursesSectionSkeleton() {
  return <FeaturedCoursesSkeleton />;
}
