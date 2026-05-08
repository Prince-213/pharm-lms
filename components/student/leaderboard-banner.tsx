"use client";

import { Trophy, Sparkles } from "lucide-react";
import Image from "next/image";

export function LeaderboardBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm border border-slate-100 sm:p-12 pb-0 h-[40vh] overflow-y-hidden">
     
      <div
        id="leaderboard-banner"
        className="relative z-10 flex flex-col items-center text-center"
      >
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          Leaderboard
        </h1>
        <p className="mt-4 max-w-xl text-lg  text-slate-500">
          Explore available categories and unlock your potential. Earn point
          rewards as you learn and climb to the top.
        </p>

        <div className=" w-[20rem] h-[20rem]  bg-center bg-cover" style={{
          backgroundImage: `url("/assets/trophy.png")`
        }} ></div>
      </div>

      {/* Aurora Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 h-[150%] w-[150%] bg-linear-to-br from-[var(--primary)]/10 via-emerald-100/5 to-teal-100/5 blur-[120px]" />

        {/* Animated-like aurora blobs */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[var(--primary)] opacity-[0.08] blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-500 opacity-[0.05] blur-[100px]" />

        {/* Subtle grid or grain if possible - skipped for simplicity, sticking to aurora */}
      </div>

      {/* Floating accents */}
      <div className="absolute right-[10%] top-[20%] h-3 w-3 rounded-full bg-[var(--primary)] opacity-20" />
      <div className="absolute left-[5%] bottom-[15%] h-5 w-5 rounded-full bg-amber-200 opacity-40" />
      <div className="absolute right-[20%] bottom-[10%] h-2 w-2 rounded-full bg-[var(--primary)] opacity-10" />
    </div>
  );
}
