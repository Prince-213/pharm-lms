"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mergeMentorNewCourseDraft, readMentorNewCourseDraft } from "@/lib/mentor-new-course-draft";

export default function NewCourseStep3Page() {
  const [category, setCategory] = useState("");
  const categories = [
    "Pharmacy",
    "Clinical Pharmacy",
    "Pharmacology",
    "Healthcare",
    "Public Health",
    "Nursing",
    "Medicine",
    "Laboratory Science",
    "Biochemistry",
    "Patient Safety",
    "Medical Ethics",
    "Research Methods",
    "Exam Preparation",
  ];

  useEffect(() => {
    const draft = readMentorNewCourseDraft();
    if (draft.category) setCategory(draft.category);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <header className="border-b border-[#d1d7dc] bg-white">
        <div className="flex h-10 items-center justify-between px-4 text-xs">
          <span className="text-lg font-bold">PharmLms</span>
          <span>Step 2 of 3</span>
          <Link href="/tutor/courses" className="text-[var(--primary)]">
            Exit
          </Link>
        </div>
        <div className="h-0.5 w-2/3 bg-[var(--primary)]" />
      </header>
      <main className="mx-auto max-w-[640px] px-6 py-16">
        <h1 className="text-center text-4xl font-bold">
          What category best fits the knowledge you'll share?
        </h1>
        <p className="mt-3 text-center text-sm text-[#6a6f73]">
          If you're not sure about the right category, you can change it later.
        </p>
        <div className="mt-10">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 w-full border border-[#d1d7dc] bg-white px-3 text-sm"
          >
            <option value="">Choose a category</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-[#d1d7dc] bg-white px-4 py-3">
        <Link
          href="/tutor/courses/new/step-2"
          className="rounded-sm border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)]"
        >
          Previous
        </Link>
        <Link
          href="/tutor/courses/new/step-4"
          onClick={() => mergeMentorNewCourseDraft({ category })}
          className={`rounded-sm px-3 py-1 text-xs font-semibold text-white ${category ? "bg-[var(--primary)]" : "bg-[#c0c4cc] pointer-events-none"}`}
        >
          Continue
        </Link>
      </footer>
    </div>
  );
}
