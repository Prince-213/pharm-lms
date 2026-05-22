import Link from "next/link";
import { BookOpen, Heart, Lightbulb, Monitor, Users } from "lucide-react";
import Image from "next/image";
import { PartnersSection } from "./partners-section";

export function HeroSection() {
  return (
    <section className="relative overflow-x-hidden bg-gradient-to-br from-emerald-50/60 via-white to-white py-8 lg:py-16">
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--emerald)]/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-100/40 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto grid w-[90%] lg:w-[80%] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-10">
        {/* Left */}
        <div>
          <Image src="/assets/twirl-top.png" className="absolute -left-34 top-0 opacity-60" alt="Hero Section Left" width={420} height={420} />

          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-[var(--ink-deep)] sm:text-5xl lg:text-[4.25rem]">
            Up Your{" "}
            <span className="text-[var(--emerald)]">Skills</span>
            <br />
            To{" "}
            <span className="text-[var(--emerald)]">Advance</span> Your
            <br />
            <span className="text-[var(--emerald)]">Career</span> Path
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#646464] sm:text-lg">
            Learn clinical pharmacy skills with PharmLMS. The latest online
            learning system and material that help your knowledge growing.
          </p>

          <div className="mt-8 flex flex-wrap gap-5">
            <Link
              href="/student/signup"
              className="inline-flex items-center rounded-lg bg-[var(--emerald)] px-[28px] text-[18px] py-4.5 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--primary)] active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/student/browse"
              className="inline-flex z-50 shadow-md shadow-gray-300/40 items-center rounded-lg px-[28px] text-[18px] py-4.5 text-sm font-semibold text-[var(--emerald)] transition bg-emerald-50 active:scale-95"
            >
              Watch Demo
            </Link>
          </div>

          {/* Feature badges */}
          <div className="mt-12 flex flex-wrap gap-8 text-base font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <BookOpen className="h-[32px] w-[32px] text-amber-500" />
              Evidence-Based Practice
            </span>
            <span className="flex items-center gap-2">
              <Image src="/assets/Briefcase.png" className="h-[32px] w-[32px] object-contain" alt="Briefcase" width={32} height={32} />
              Patient-Centered
            </span>
            <span className="flex items-center gap-2">
             <Image src="/assets/idea.svg" className="h-[32px] w-[32px] object-contain" alt="Briefcase" width={32} height={32} />
              Critical Thinking
            </span>
          </div>
        </div>

        {/* Right: circular image + stats */}
        <div className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:max-w-none ">
          <Image src="/assets/twirl-right.png" className="absolute -right-40 -bottom-40 opacity-80" alt="Hero Section Left" width={420} height={420} />
          {/* Decorative outline circles */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div className="absolute h-[520px] w-[520px] rounded-full border border-slate-300 sm:h-[580px] sm:w-[580px]" />
          </div>

          {/* Main circle with photo */}
          <div className="relative h-[550px] w-[550px] translate-y-4 translate-x-4 overflow-hidden rounded-full bg-[var(--emerald)] shadow-2xl sm:h-[550px] sm:w-[550px]">
            <img
              src="https://images.pexels.com/photos/8199174/pexels-photo-8199174.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Pharmacy student holding books, smiling — photo by Yan Krukau on Pexels"
              className="h-full w-full object-cover object-top"
            />
          </div>

          {/* Stat: Video Courses */}
          <div className="absolute min-w-fit backdrop-blur-sm left-0 top-40 flex -translate-y-0 items-center gap-[23px] rounded-[18px] bg-[#F5F5F4] p-[18px] shadow-[var(--shadow-3)] -translate-x-5 lg:-left-4 border border-[var(--emerald)]">
            
            <div className="relative h-[50px] w-[50px] shadow-lg shadow-gray-400/60 overflow-hidden rounded-[11px]">
              <Image src="/assets/monitor.png" className=" object-contain" alt="Video Courses" fill />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[25px] font-bold leading-tight text-[var(--ink-deep)]">2K+</p>
              <p className="text-[15px] text-gray-500">Video Courses</p>
            </div>
          </div>

          {/* Stat: Online Courses */}
        

          <div className="absolute lg:right-2 max-w-fit backdrop-blur-sm -top-4 right-0 flex flex-col items-center justify-center  -translate-y-0 gap-[5px] rounded-[18px] bg-[#F5F5F4] p-[18px] shadow-[var(--shadow-3)]  border border-[var(--emerald)]">
            
            <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full">
              <Image src="/assets/Ring.png" className=" object-contain" alt="Video Courses" fill />
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-[8px]">

              <p className="text-[25px] font-bold leading-tight text-[var(--ink-deep)]">5K+</p>
              <p className="text-[15px] text-gray-500">Online Courses</p>
              
              
            </div>
          </div>

          

          {/* Stat: Tutors */}
          <div className="absolute lg:right-10 max-w-fit backdrop-blur-sm right-0 bottom-4 flex -translate-y-0 items-center gap-[18px] rounded-[18px] bg-[#F5F5F4] p-[18px] shadow-[var(--shadow-3)]  border border-[var(--emerald)]">
            
            <div className="relative h-[50px] w-[50px] shadow-lg shadow-gray-400/60 overflow-hidden rounded-[11px]">
              <Image src="/assets/tutor.png" className=" object-contain" alt="Video Courses" fill />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[15px] text-gray-500">Tutors</p>
              <p className="text-[25px] font-bold leading-tight text-[var(--ink-deep)]">250+</p>
              
            </div>
          </div>
          
          
        </div>
      </div>

      <div className="mt-16">
        <PartnersSection />
      </div>
    </section>
  );
}
