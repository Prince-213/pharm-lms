import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#191c1d]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#10b981]/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-[#0f5238]/10 blur-3xl"
          aria-hidden
        />

        <header className="relative z-10 border-b border-white/60 bg-white/90 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex h-[100px] max-w-6xl items-center gap-6 px-6 lg:px-10">
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-[#0f5238]">
              PharmLMS
            </Link>
            <nav className="hidden flex-1 flex-wrap items-center justify-center gap-8 text-sm font-medium text-[#404943] md:flex">
              <span className="cursor-default hover:text-[#0f5238]">Home</span>
              <span className="cursor-default hover:text-[#0f5238]">About us</span>
              <Link href="/student/browse" className="hover:text-[#0f5238]">
                Courses
              </Link>
              <span className="cursor-default hover:text-[#0f5238]">Contact us</span>
              <span className="cursor-default hover:text-[#0f5238]">FAQ&apos;s</span>
            </nav>
            <div className="ml-auto flex items-center gap-4">
              <Link href="/student/login" className="text-sm font-semibold text-[#404943] hover:text-[#0f5238]">
                Sign in
              </Link>
              <Link
                href="/student/browse"
                className="rounded-md bg-[#0f5238] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0a3d2a]"
              >
                Explore catalog
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5238]">
                Clinical Mentor Program
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-[#0f172a] sm:text-5xl lg:text-[3.25rem]">
                Evidence-led pharmacy training for the whole care team
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#404943]">
                Structured courses, mentor review, and admin oversight — aligned with how modern PharmD programs run
                online.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/student/browse"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a4f] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#245a43]"
                >
                  Start learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tutor/login"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-[#0f5238] px-6 py-3.5 text-sm font-semibold text-[#0f5238] transition hover:bg-[#ecfdf5]"
                >
                  Tutor portal
                </Link>
              </div>
              <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e2e8f0] bg-white/80 p-4 shadow-sm">
                  <p className="font-display text-2xl font-bold text-[#0f172a]">5K+</p>
                  <p className="text-xs font-medium text-[#64748b]">Learning activities</p>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-white/80 p-4 shadow-sm">
                  <p className="font-display text-2xl font-bold text-[#0f172a]">2K+</p>
                  <p className="text-xs font-medium text-[#64748b]">Video lessons</p>
                </div>
                <div className="hidden rounded-xl border border-[#e2e8f0] bg-white/80 p-4 shadow-sm sm:block">
                  <p className="font-display text-2xl font-bold text-[#0f172a]">120+</p>
                  <p className="text-xs font-medium text-[#64748b]">Mentor authors</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-square max-h-[420px] overflow-hidden rounded-full border border-[#e2e8f0] bg-gradient-to-br from-[#ecfdf5] to-[#e0f2fe] shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center p-10 text-center">
                  <div>
                    <GraduationCap className="mx-auto h-16 w-16 text-[#0f5238]" strokeWidth={1.25} />
                    <p className="mt-6 font-display text-lg font-bold text-[#0f172a]">Your cohort. Your curriculum.</p>
                    <p className="mt-2 text-sm text-[#64748b]">Secure video, progress, and admin-approved publishing.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section id="portals" className="mt-24 border-t border-[#e2e8f0] pt-16">
            <h2 className="text-center font-display text-2xl font-bold text-[#0f172a]">Choose your portal</h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#64748b]">
              Same platform — role-specific dashboards inspired by the PharmLMS design system.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              <Link
                href="/student/login"
                className="group flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition hover:border-[#10b981]/40 hover:shadow-md"
              >
                <CheckCircle2 className="h-10 w-10 text-[#10b981]" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-lg font-bold text-[#0f172a]">Students</h3>
                <p className="mt-2 flex-1 text-sm text-[#64748b]">Browse, enroll, and learn section by section with progress tracking.</p>
                <span className="mt-6 text-sm font-semibold text-[#0f5238] group-hover:underline">Student login →</span>
              </Link>
              <Link
                href="/tutor/login"
                className="group flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition hover:border-[#10b981]/40 hover:shadow-md"
              >
                <GraduationCap className="h-10 w-10 text-[#0f5238]" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-lg font-bold text-[#0f172a]">Tutors</h3>
                <p className="mt-2 flex-1 text-sm text-[#64748b]">Author courses, manage curriculum, and submit for clinical review.</p>
                <span className="mt-6 text-sm font-semibold text-[#0f5238] group-hover:underline">Tutor login →</span>
              </Link>
              <Link
                href="/mentor/login"
                className="group flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition hover:border-[#10b981]/40 hover:shadow-md"
              >
                <GraduationCap className="h-10 w-10 text-[#2d6a4f]" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-lg font-bold text-[#0f172a]">Mentors</h3>
                <p className="mt-2 flex-1 text-sm text-[#64748b]">Set up your profile, submit for approval, and take 1-on-1 sessions with students.</p>
                <span className="mt-6 text-sm font-semibold text-[#0f5238] group-hover:underline">Mentor login →</span>
              </Link>
              <Link
                href="/admin/login"
                className="group flex flex-col rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition hover:border-[#10b981]/40 hover:shadow-md"
              >
                <Shield className="h-10 w-10 text-[#0f172a]" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-lg font-bold text-[#0f172a]">Administration</h3>
                <p className="mt-2 flex-1 text-sm text-[#64748b]">Course oversight, users, badges, and communications.</p>
                <span className="mt-6 text-sm font-semibold text-[#0f5238] group-hover:underline">Admin login →</span>
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#e2e8f0] bg-white py-10 text-center text-xs text-[#64748b]">
          <p>© {new Date().getFullYear()} Pharm LMS · Clinical learning infrastructure</p>
        </footer>
      </div>
    </div>
  );
}
