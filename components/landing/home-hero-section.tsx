"use client";

import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const HomeHeroSection = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/courses?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/courses");
    }
  };

  return (
    <div className="gap-y-8 lg:w-[79%] xl:w-[60%] w-[90%] mx-auto py-12 lg:py-[6rem] flex flex-col items-center justify-center px-4">
      <div className="text-base font-medium text-[#5A536C] py-[2px] px-[11px] rounded-lg border border-[var(--border)]">
        <p>100% Quality Courses</p>
      </div>
      <h1 className="text-center font-display text-[30px] font-bold leading-[1.15] text-[var(--ink-deep)] sm:text-[48px] lg:text-[64px]">
        <span className="inline-flex items-center gap-3 flex-wrap justify-center">
          Discover Top
          <span className="relative">
            <img
              src="/assets/online.png"
              alt=""
              className="inline-block h-10 w-auto sm:h-14 lg:h-20 absolute left-0 -z-0"
              aria-hidden="true"
            />
            <p className="z-50 relative text-white ">online</p>
          </span>
          <img
            src="/assets/book.png"
            alt=""
            className="inline-block h-10 w-auto sm:h-14 lg:h-20"
            aria-hidden="true"
          />
          <span className="relative inline-block">
            Courses
            <img
              src="/assets/underline.png"
              alt=""
              className="absolute -bottom-5 left-0 w-full h-10 object-contain"
              aria-hidden="true"
            />
          </span>
        </span>
        <br />
        <span className="mt-2 block">& Start Learning Today</span>
      </h1>
      <form onSubmit={handleSearch} className=" w-full lg:w-[90%] mx-auto">
        <div className="w-full h-fit flex items-center gap-3 sm:gap-5 justify-between">
          <div className="w-full gap-3 sm:gap-5 flex items-center overflow-hidden rounded-[18px] border border-[var(--border)] h-14 sm:h-20 bg-white">
            <div className="w-fit border-r h-full border-[var(--border)] flex items-center gap-1 sm:gap-12 px-3 sm:px-4">
              <p className="text-xs sm:text-sm font-semibold whitespace-nowrap">All Categories</p>
              <ChevronDown className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none border-none flex-1 px-3 text-sm"
              placeholder="Find Courses..."
            />
          </div>
          <button
            type="submit"
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[var(--emerald)] flex items-center justify-center shrink-0"
          >
            <MagnifyingGlassIcon className="text-white w-5 h-5 sm:w-7 sm:h-7" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-5 h-5 bg-[var(--emerald)] rounded-full flex items-center justify-center shrink-0">
            <CheckIcon className="text-white w-3 h-3" />
          </div>
          <p className="text-xs sm:text-sm font-semibold">
            Industry Leaders Use These Courses to Keep Skills Sharp
          </p>
        </div>
      </form>
    </div>
  );
};

export default HomeHeroSection;
